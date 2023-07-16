/** @jsxImportSource react */

import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";

import { qwikify$ } from "@builder.io/qwik-react";

import {
  MediaCommunitySkin,
  MediaOutlet,
  MediaPlayer,
  MediaPoster,
  MediaSliderVideo,
  MediaTimeSlider,
  useMediaPlayer,
} from "@vidstack/react";
import chaptervtt from "chapter-vtt";
import {
  MediaCanPlayEvent,
  MediaPlayerElement,
  MediaProviderChangeEvent,
  isHLSProvider,
} from "vidstack";
import { useEffect, useRef, useState } from "react";
import { PipedVideo } from "~/types";
import { chaptersVtt } from "~/utils/chapters";

interface PlayerProps {
  video: PipedVideo | null | undefined;
  isMiniPlayer: boolean;
}
function Player({ video, isMiniPlayer }: PlayerProps) {
  const mediaPlayer = useRef<MediaPlayerElement | null>(null);
  let vtt = "";
  function onCanPlay(event: MediaCanPlayEvent) {
    console.log(event);
    if (!video?.chapters) return;
    if (!mediaPlayer) return;
    let chapters = [];
    for (let i = 0; i < video.chapters.length; i++) {
      const chapter = video.chapters[i];
      const name = chapter.title;
      // seconds to 00:00:00
      const timestamp = new Date(chapter.start * 1000)
        .toISOString()
        .slice(11, 22);
      const seconds =
        video.chapters[i + 1]?.start - chapter.start ??
        video.duration - chapter.start;
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

  return (
    <MediaPlayer
      load="eager"
      smallBreakpointX={600}
      largeBreakpointX={980}
      // Vertical Breakpoints
      smallBreakpointY={380}
      largeBreakpointY={600}
      className={
        isMiniPlayer ? "fixed bottom-0 right-0 scale-50 z-[99999]" : ""
      }
      autoplay
      ref={mediaPlayer}
      onProviderChange={onProviderChange}
      onCanPlay={onCanPlay}
      title={video?.title ?? ""}
      src={video?.hls ?? ""}
      poster={video?.thumbnailUrl ?? ""}
      aspectRatio={16 / 9}
      crossorigin="anonymous">
      <MediaOutlet>
        <MediaPoster alt={video?.title ?? ""} />
        {video?.subtitles?.map((subtitle) => {
          if (!subtitle.url) return null;
          return (
            <track
              key={subtitle.url}
              kind="subtitles"
              src={subtitle.url}
              srcLang={subtitle.code}
              label={subtitle.name}
              data-type={subtitle.mimeType}
            />
          );
        })}
      </MediaOutlet>
    </MediaPlayer>
  );
}

export const QPlayer = qwikify$(Player, { eagerness: "visible" });
