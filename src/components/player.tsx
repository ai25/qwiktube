/** @jsxImportSource react */

import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";

import { qwikify$ } from "@builder.io/qwik-react";

import {
  MediaBufferingIndicator,
  MediaCaptions,
  MediaChaptersMenuItems,
  MediaCommunitySkin,
  MediaGesture,
  MediaLiveIndicator,
  MediaMenu,
  MediaMenuButton,
  MediaOutlet,
  MediaPlayer,
  MediaPoster,
  MediaSlider,
  MediaSliderValue,
  MediaSliderVideo,
  MediaTimeSlider,
  useMediaPlayer,
  useMediaStore,
} from "@vidstack/react";
import {
  HLSErrorEvent,
  MediaCanPlayEvent,
  MediaErrorEvent,
  MediaPlayerElement,
  MediaProviderChangeEvent,
  isHLSProvider,
} from "vidstack";
import { ChaptersIcon } from "@vidstack/react/icons";
import { useEffect, useRef, useState } from "react";
import { PipedVideo, Subtitle } from "~/types";
import { chaptersVtt } from "~/utils/chapters";
import { ttml2srt } from "~/utils/ttml";
import PlayerSkin from "./player-skin/player-skin";
import { $, useContext, useOnWindow, useSignal } from "@builder.io/qwik";
import { DBContext, TranscriptContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";
import { RouteLocation, useLocation } from "@builder.io/qwik-city";
import { IDBPDatabase } from "idb";

interface PlayerProps {
  video: PipedVideo | null | undefined;
  isMiniPlayer: boolean;
  setTranscript: (transcript: string) => void;
  // updateProgress: (id: string, progress: number) => void;
  progress: number;
  route: RouteLocation;
  db: IDBPDatabase<unknown> | undefined;
}
const BUFFER_LIMIT = 3;
const BUFFER_TIME = 15000;
const TIME_SPAN = 300000;

function Player({ video, isMiniPlayer = false, setTranscript, progress, route, db }: PlayerProps) {
  const mediaPlayer = useRef<MediaPlayerElement | null>(null);
  let vtt = "";
  function onCanPlay(event: MediaCanPlayEvent) {
    init();
    console.log(event);
    setError(undefined);
    if (!video?.chapters) return;
    if (!mediaPlayer) return;
    let chapters = [];
    for (let i = 0; i < video.chapters.length; i++) {
      const chapter = video.chapters[i];
      const name = chapter.title;
      // seconds to 00:00:00
      const timestamp = new Date(chapter.start * 1000).toISOString().slice(11, 22);
      const seconds = video.chapters[i + 1]?.start - chapter.start ?? video.duration - chapter.start;
      chapters.push({ name, timestamp, seconds });
    }

    vtt = chaptersVtt(chapters, video.duration);
    if (vtt) {
      mediaPlayer.current?.textTracks.add({
        kind: "chapters",
        default: true,
        content: vtt,
        type: "vtt",
      });
    }
  }
  function onProviderChange(event: MediaProviderChangeEvent) {
    const provider = event.detail;
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
    }
  }
  const [subtitles, setSubtitles] = useState<Map<string, string>>();
  useEffect(() => {
    console.log("received new video");
    if (!video?.subtitles) return;
    const subs = new Map<string, string>();
    video.subtitles.forEach((subtitle) => {
      if (!subtitle.url) return;
      subs.set(subtitle.code, subtitle.url);
    });
    setSubtitles(subs);
  }, [video]);

  async function handleTextTrackChange(e: any) {
    console.log(e, "text track change");
    // if (!e.detail?.language) return;
    // const code = e.detail.language;
    // const { srtUrl, srtText } = await ttml2srt(subtitles?.get(code) ?? "");
    // setTranscript(srtText);
    // const track = document.querySelector(`#track-${code}`) as HTMLTrackElement | undefined;
    // console.log(track, code, srtUrl, "text track");
    // if (!track) return;
    // track.src = srtUrl;
  }

  const [error, setError] = useState<{
    name: string;
    details: string;
    fatal: boolean;
    message: string;
    code: number | undefined;
  }>();

  function handleHlsError(err: HLSErrorEvent) {
    console.log(err.detail);
    setError({
      name: err.detail.error.name,
      code: err.detail.response?.code,
      details: err.detail.details,
      fatal: err.detail.fatal,
      message: err.detail.error.message,
    });
  }

  function selectDefaultQuality() {
    let preferredQuality = 1080; // TODO: get from user settings
    if (!mediaPlayer.current) return;
    console.log(mediaPlayer.current.qualities);
    const q = mediaPlayer.current.qualities.toArray().find((q) => q.height >= preferredQuality);
    console.log(q);
    if (q) {
      q.selected = true;
    }
  }
  const pos = {
    tl: "top-0 -left-72",
  };

  const { started } = useMediaStore(mediaPlayer);
  const [tracks, setTracks] = useState<
    { id: string; key: string; kind: string; src: string; srcLang: string; label: string; dataType: string }[]
  >([]);

  const fetchSubtitles = async (subtitles: Subtitle[]) => {
    console.time("fetching subtitles");
    const newTracks = await Promise.all(
      subtitles.map(async (subtitle) => {
        if (!subtitle.url) return null;
        if (subtitle.mimeType !== "application/ttml+xml")
          return {
            id: `track-${subtitle.code}`,
            key: subtitle.url,
            kind: "subtitles",
            src: subtitle.url,
            srcLang: subtitle.code,
            label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
            dataType: subtitle.mimeType,
          };
        const { srtUrl, srtText } = await ttml2srt(subtitle.url);
        // remove empty subtitles
        if (srtText.trim() === "") return null;
        return {
          id: `track-${subtitle.code}`,
          key: subtitle.url,
          kind: "subtitles",
          src: srtUrl,
          srcLang: subtitle.code,
          label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
          dataType: "srt",
        };
      })
    );
    console.timeEnd("fetching subtitles");
    setTracks(newTracks.filter((track) => track !== null) as any);
  };
  async function init() {
    if (!video) return;
    console.time("init");
    const time = route.url.searchParams.get("t");

    console.log(time, "time", db, "db");
    if (time) {
      let start = 0;
      if (/^[\d]*$/g.test(time)) {
        start = parseInt(time);
      } else {
        const hours = /([\d]*)h/gi.exec(time)?.[1];
        const minutes = /([\d]*)m/gi.exec(time)?.[1];
        const seconds = /([\d]*)s/gi.exec(time)?.[1];
        if (hours) {
          start += parseInt(hours) * 60 * 60;
        }
        if (minutes) {
          start += parseInt(minutes) * 60;
        }
        if (seconds) {
          start += parseInt(seconds);
        }
      }
      if (mediaPlayer.current) mediaPlayer.current.currentTime = start;
      // this.initialSeekComplete = true;
    } else if (db) {
      const tx = db.transaction("watch_history", "readwrite");
      const store = tx.objectStore("watch_history");
      const val = await store.get(extractVideoId(video?.thumbnailUrl ?? ""));
      console.log(val, "val");
      const currentTime = val?.progress;
      if (currentTime) {
        if (currentTime < video.duration * 0.9) {
          if (mediaPlayer.current) mediaPlayer.current.currentTime = currentTime;
        }
      }
      console.timeEnd("init");
    }
    fetchSubtitles(video.subtitles);
  }

  async function updateProgress() {
    console.log("updating progress");
    if (!video) return;
    if (!mediaPlayer.current) return;
    if (video.duration < 60) return;
    if (video.category === "Music") return;
    const currentTime = mediaPlayer.current.currentTime;
    const tx = db?.transaction("watch_history", "readwrite");
    const store = tx?.objectStore("watch_history");
    await store?.put({ ...video, progress: currentTime }, extractVideoId(video.thumbnailUrl));
    console.log(`updated progress for ${video.title} to ${currentTime}`);
  }

  useEffect(() => {
    window.addEventListener("beforeunload", updateProgress);
    return () => {
      window.removeEventListener("beforeunload", updateProgress);
    };
  }, []);

  useEffect(() => {
    console.log("route changed updating progress");
    updateProgress();
  }, [started, route]);

  return (
    <MediaPlayer
      onDestroy={() => console.log("destroyed")}
      currentTime={progress}
      onTextTrackChange={handleTextTrackChange}
      load="eager"
      // className={
      //   isMiniPlayer ?  `fixed z-[99999] ${pos.tl} scale-[0.4]` : ""
      // }
      autoplay
      ref={mediaPlayer}
      onProviderChange={onProviderChange}
      onCanPlay={onCanPlay}
      title={video?.title ?? ""}
      src={video?.hls ?? ""}
      poster={video?.thumbnailUrl ?? ""}
      aspectRatio={16 / 9}
      onHlsError={handleHlsError}
      crossorigin="anonymous"
    >
      <MediaOutlet>
        <MediaPoster alt={video?.title ?? ""} />
        {tracks.map((track) => {
          return (
            <track
              id={track.id}
              key={track.key}
              kind={track.kind}
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              data-type={track.dataType}
            />
          );
        })}
        {/* <track
          id="track-transcript"
          kind="subtitles"
          src="subs.srt"
          srcLang="en"
          label="Transcript"
          data-type="srt"
        /> */}
        {/* <MediaCaptions className="transition-[bottom] not-can-control:opacity-100 user-idle:opacity-100 not-user-idle:bottom-[80px]" /> */}
      </MediaOutlet>
      {error?.fatal ? (
        <div className="absolute top-0 right-0 w-full h-full opacity-100 pointer-events-auto bg-black/50">
          <div className="flex flex-col items-center justify-center w-full h-full gap-3">
            <div className="text-2xl font-bold text-white">
              {error.name} {error.details}
            </div>
            <div className="flex flex-col">
              <div className="text-lg text-white">{error.message}</div>
              <div className="text-lg text-white">
                Please try switching to a different instance or refresh the page.
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <button
                className="px-4 py-2 text-lg text-white border border-white rounded-md"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <button
                className="px-4 py-2 text-lg text-white border border-white rounded-md"
                onClick={() => {
                  setError(undefined);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
        // <div className="absolute top-0 right-0 opacity-0 pointer-events-none bg-black/50">
        //   <div className="absolute top-0 right-0 z-10 flex flex-col justify-between w-full h-full text-white transition-opacity duration-200 ease-linear opacity-0 pointer-events-none can-control:opacity-100">
        //     <div className="text-sm text-white">Buffering?</div>
        //     <div className="text-xs text-white">Try switching to a different instance.</div>
        //   </div>
        // </div>
      )}
      <PlayerSkin video={video} isMiniPlayer={isMiniPlayer} />
      {/* <MediaCommunitySkin /> */}
    </MediaPlayer>
  );
}

export const QPlayer = qwikify$(Player, {
  eagerness: "visible",
});
