/** @jsxImportSource react */
import type { MediaMenuItemsProps } from "@vidstack/react";
import {
  MediaCaptionButton,
  MediaCaptions,
  MediaCaptionsMenuItems,
  MediaChaptersMenuItems,
  MediaFullscreenButton,
  MediaGesture,
  MediaLiveIndicator,
  MediaMenu,
  MediaMenuButton,
  MediaMenuItems,
  MediaMuteButton,
  MediaPlayButton,
  MediaPlaybackRateMenuItems,
  MediaQualityMenuItems,
  MediaSliderValue,
  MediaSliderVideo,
  MediaTime,
  MediaTimeSlider,
  MediaTooltip,
  MediaVolumeSlider,
} from "@vidstack/react";
import {
  ArrowLeftIcon,
  ChaptersIcon,
  ChevronRightIcon,
  ClosedCaptionsIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  MuteIcon,
  OdometerIcon,
  PauseIcon,
  PlayIcon,
  PlaylistIcon,
  ReplayIcon,
  SettingsIcon,
  SettingsMenuIcon,
  VolumeHighIcon,
  VolumeLowIcon,
} from "@vidstack/react/icons";
import React from "react";
import type { Chapter, PipedVideo, RelatedStream } from "~/types";

interface PlayerSkinProps {
  video: PipedVideo | null | undefined;
  isMiniPlayer: boolean;
}
export default function PlayerSkin({ video, isMiniPlayer }: PlayerSkinProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex h-full flex-col justify-between text-white opacity-0 transition-opacity duration-200 ease-linear can-control:opacity-100"
      role="group"
      aria-label="Media Controls"
    >
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-black/50 from-5% via-transparent via-50% to-black/20 to-100%" />
      <MediaGesture
        className="left-0 top-0 z-10 h-full w-full bg-green-500/50"
        event="pointerup"
        action="toggle:paused"
      ></MediaGesture>
      <MediaGesture className="left-0 top-0 h-full w-full" event="dblpointerup" action="toggle:fullscreen" />
      <MediaGesture className="left-0 top-0 z-10 h-full w-1/5" event="dblpointerup" action="seek:-10" />
      <MediaGesture className="right-0 top-0 z-10 h-full w-1/5" event="dblpointerup" action="seek:10" />
      <MediaControlGroup>
        <div className="z-10 flex w-full items-center justify-start truncate font-sans text-lg font-normal text-white">
          <p className="truncate">{video?.title}</p>
        </div>
        <div className="flex w-max items-center justify-end">
          <MediaMuteButton className="group peer flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary sm:hidden">
            {/* icons */}
            <MuteIcon className="hidden group-data-[volume=muted]:block" />
            <VolumeLowIcon className="hidden group-data-[volume=low]:block" />
            <VolumeHighIcon className="hidden group-data-[volume=high]:block" />
            {/* tooltip */}
            <MediaTooltip className="" style={{ transformOrigin: "50% 100%" }}>
              <span className="hidden not-muted:inline">Mute</span>
              <span className="hidden muted:inline">Unmute</span>
            </MediaTooltip>
          </MediaMuteButton>
          <ChaptersMenu chapters={video?.chapters} />
          <SettingsMenu />
        </div>
      </MediaControlGroup>
      <div className="pointer-events-none flex min-h-[48px] w-full p-2 ">
        <BufferingIndicator />
      </div>
      {/* <div className="absolute inset-0 z-50 flex flex-col justify-center w-full h-full text-white transition-opacity duration-200 ease-linear pointer-events-none">
        <PlayIcon className="w-10 h-10 mx-auto" />
      </div> */}

      <div className="pointer-events-none flex w-full max-w-full shrink flex-col px-2 pb-2 can-control:pointer-events-auto">
        <div className="flex items-center">
          <MediaTimeSlider
            className="group mx-2.5 flex h-10 w-full items-center"
            trackClass="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-white/50 outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
            trackFillClass="live:bg-red-500 absolute top-1/2 left-0 z-20 h-1 w-[var(--slider-fill-percent)] -translate-y-1/2 bg-primary will-change-[width]"
            trackProgressClass="absolute top-1/2 left-0 z-10 h-1 w-[var(--media-buffered-percent)] -translate-y-1/2 bg-white will-change-[width]"
            thumbContainerClass="absolute top-0 left-[var(--slider-fill-percent)] z-20 h-full w-5 -translate-x-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]"
            thumbClass="absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity duration-150 ease-in group-data-[interactive]:opacity-100"
            chaptersClass="relative flex items-center w-full h-full"
            chapterContainerClass="flex items-center w-[var(--width)] h-full mr-0.5 last:mr-0"
            chapterClass="relative flex items-center w-full h-1"
          >
            <div
              slot="preview"
              className="absolute left-[var(--preview-left)] z-10 -translate-x-1/2 rounded px-4 pb-8 text-white/80 opacity-0 transition-opacity duration-200 ease-out group-data-[interactive]:opacity-100 group-data-[interactive]:ease-in"
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="absolute bottom-[-1.6rem] z-50 flex flex-col items-center justify-center gap-1 ">
                  <MediaSliderValue type="pointer" format="time" className="z-50 rounded shadow-sm " />
                  <div className="truncate rounded px-2 text-sm shadow-sm">
                    <span part="chapter-title" />
                  </div>
                </div>
                <MediaSliderVideo
                  src={video?.videoStreams.find((s) => s.bitrate < 400000)?.url}
                  onError={console.error}
                />
              </div>
            </div>
          </MediaTimeSlider>
          <MediaLiveIndicator className="flex h-10 w-10 items-center justify-center text-white not-live:hidden">
            <div className="rounded-sm bg-gray-400 px-1 py-px font-sans text-xs font-bold uppercase tracking-widest text-slate-800 live-edge:bg-red-500 live-edge:text-white">
              live
            </div>
          </MediaLiveIndicator>
        </div>

        <div className="flex w-full max-w-full justify-between ">
          <div className="flex w-full min-w-0 items-center justify-start">
            <div className="flex w-full max-w-full items-center justify-start">
              <MediaPlayButton
                className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary"
                aria-label="Play"
              >
                <PlayIcon className="hidden ring-0 ended:hidden paused:block" />
                <PauseIcon className="hidden ring-0 not-paused:block" />
                <ReplayIcon className="hidden ring-0 ended:block" />
                <MediaTooltip className="" style={{ transformOrigin: "50% 100%" }}>
                  <span className="hidden paused:inline">Play</span>
                  <span className="hidden not-paused:inline">Pause</span>
                </MediaTooltip>
              </MediaPlayButton>
              <div className="peer flex min-w-0 max-w-[8rem] items-center sm:w-full">
                <MediaMuteButton className="group peer hidden h-10 w-10 min-w-0 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary sm:flex">
                  {/* icons */}
                  <MuteIcon className="hidden ring-0 group-data-[volume=muted]:block" />
                  <VolumeLowIcon className="hidden ring-0 group-data-[volume=low]:block" />
                  <VolumeHighIcon className="hidden ring-0 group-data-[volume=high]:block" />
                  {/* tooltip */}
                  <MediaTooltip className="" style={{ transformOrigin: "50% 100%" }}>
                    <span className="hidden not-muted:inline">Mute</span>
                    <span className="hidden muted:inline">Unmute</span>
                  </MediaTooltip>
                </MediaMuteButton>
                <MediaVolumeSlider
                  className="group mr-0 hidden h-10 w-full  flex-1 origin-left -scale-x-0 items-center p-0 transition-all duration-200 data-[hocus]:scale-x-100  group-data-[hocus]:scale-x-100 peer-data-[hocus]:scale-x-100 sm:flex"
                  trackClass="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-[#5a595a] outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                  trackFillClass="absolute top-1/2 left-0 z-20 h-1 w-[var(--slider-fill-percent)] -translate-y-1/2 bg-white will-change-[width]"
                  thumbContainerClass="absolute top-0 left-[var(--slider-fill-percent)] z-20 h-full w-5 -translate-x-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]"
                  thumbClass="absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity duration-150 ease-in group-data-[interactive]:opacity-100"
                >
                  <div className="left-[var(--preview-left)] " slot="preview">
                    <MediaSliderValue type="pointer" format="percent" />
                  </div>
                </MediaVolumeSlider>
              </div>

              <div className="flex min-h-[48px] min-w-0 max-w-full items-center text-xs transition-all duration-200 peer-data-[hocus]:ml-2.5 sm:ml-[-4rem]">
                <MediaTime type="current" className="flex items-center px-1 text-sm text-white" />
                /
                <MediaTime type="duration" className="flex items-center px-1 text-sm text-white" />
                <div className="hidden items-center justify-start overflow-hidden sm:flex">
                  •{" "}
                  <span className="z-10 min-w-0 max-w-full truncate pl-1 font-sans text-sm font-normal text-white ">
                    {video?.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <MediaPlayButton className="group flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary">
              {/* icons */}
              <PlayIcon className="hidden paused:block" />
              <PauseIcon className="hidden not-paused:block" />
              {/* tooltip */}
              <MediaTooltip className="" style={{ transformOrigin: "50% 100%" }}>
                <span className="hidden paused:inline">Play</span>
                <span className="hidden not-paused:inline">Pause</span>
              </MediaTooltip>
            </MediaPlayButton>
            <RecommendedVideosMenu videos={video?.relatedStreams} />
            <FullscreenButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function FullscreenButton() {
  return (
    <MediaFullscreenButton className="group flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary">
      {/* icons */}
      <FullscreenIcon className="hidden ring-0 not-fullscreen:block" />
      <FullscreenExitIcon className="hidden ring-0 fullscreen:block" />
      {/* tooltip */}
      <MediaTooltip className="tooltip" style={{ transformOrigin: "50% 100%" }}>
        <span className="hidden not-fullscreen:inline">Enter Fullscreen</span>
        <span className="hidden fullscreen:inline">Exit Fullscreen</span>
      </MediaTooltip>
    </MediaFullscreenButton>
  );
}

function MediaControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none flex min-h-[48px] w-full items-center justify-between p-2 can-control:pointer-events-auto">
      {children}
    </div>
  );
}

function SettingsMenu() {
  return (
    <MediaMenu className="relative inline-block">
      <MediaMenuButton
        className="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
        aria-label="Settings"
      >
        <SettingsIcon className="h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-aria-expanded:rotate-90 group-data-[focus]:ring-4 group-data-[focus]:ring-primary" />
      </MediaMenuButton>
      <MediaMenuItems className="absolute bottom-full right-0 h-[var(--menu-height)] min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[resizing]:overflow-hidden sm:top-full">
        <CaptionsMenu />
        <QualityMenu />
        <PlaybackRateMenu />
      </MediaMenuItems>
    </MediaMenu>
  );
}

function CaptionsMenu() {
  return (
    <MediaMenu className="text-sm text-white">
      <CaptionsMenuButton />
      <MediaCaptionsMenuItems
        className="relative flex flex-col p-1 aria-hidden:hidden"
        radioGroupClass="w-full"
        radioClass="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radioCheckClass="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </MediaMenu>
  );
}

function CaptionsMenuButton() {
  return (
    <MediaMenuButton className="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <ArrowLeftIcon className="hidden h-4 w-4 group-aria-expanded:inline" />
      <ClosedCaptionsIcon className="h-6 w-6 group-aria-expanded:hidden" />
      <span className="ml-1.5">Captions</span>
      <span className="ml-auto text-white/50" slot="hint"></span>
      <ChevronRightIcon className="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden" />
    </MediaMenuButton>
  );
}
function QualityMenu() {
  return (
    <MediaMenu className="text-sm text-white">
      <QualityMenuButton />
      <MediaQualityMenuItems
        className="relative flex flex-col p-1 aria-hidden:hidden"
        radioGroupClass="w-full"
        radioClass="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radioCheckClass="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-gray-500 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </MediaMenu>
  );
}

function QualityMenuButton() {
  return (
    <MediaMenuButton className="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <ArrowLeftIcon className="hidden h-4 w-4 group-aria-expanded:inline" />
      <SettingsMenuIcon className="h-6 w-6 group-aria-expanded:hidden" />
      <span className="ml-1.5">Quality</span>
      <span className="ml-auto text-white/50" slot="hint"></span>
      <ChevronRightIcon className="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden" />
    </MediaMenuButton>
  );
}

function PlaybackRateMenu() {
  return (
    <MediaMenu className="text-sm text-white">
      <PlaybackRateMenuButton />
      <MediaPlaybackRateMenuItems
        className="relative flex flex-col p-1 aria-hidden:hidden"
        radioGroupClass="w-full"
        radioClass="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radioCheckClass="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-gray-500 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </MediaMenu>
  );
}

function PlaybackRateMenuButton() {
  return (
    <MediaMenuButton className="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <ArrowLeftIcon className="hidden h-4 w-4 group-aria-expanded:inline" />
      <OdometerIcon className="h-6 w-6 group-aria-expanded:hidden" />
      <span className="ml-1.5">Speed</span>
      <span className="ml-auto text-white/50" slot="hint"></span>
      <ChevronRightIcon className="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden" />
    </MediaMenuButton>
  );
}

function RecommendedVideosMenu({ videos }: { videos?: RelatedStream[] }) {
  return (
    <MediaMenu className="relative hidden fullscreen:inline-block ">
      <RecommendedVideosMenuButton />
      <MediaMenuItems className="absolute bottom-full right-0 h-[var(--menu-height)] max-h-96 min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[resizing]:overflow-hidden">
        {videos?.map((video, index) => (
          <div
            key={index}
            className="flex items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
          >
            <div
              className="h-9 w-16 shrink-0 rounded-md bg-bg1"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
            />
            <div className="ml-2 flex grow flex-col">
              <div className="text-sm text-white">{video.title}</div>
              <div className="text-xs text-white/50">{video.uploaderName}</div>
            </div>
          </div>
        ))}
      </MediaMenuItems>
    </MediaMenu>
  );
}

function RecommendedVideosMenuButton() {
  return (
    <MediaMenuButton
      className="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
      aria-label="Recommended Videos"
    >
      <PlaylistIcon className="h-8 w-8 rounded-sm group-data-[focus]:ring-4 group-data-[focus]:ring-primary" />
    </MediaMenuButton>
  );
}

function BufferingIndicator() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
      <svg
        className="h-24 w-24 text-white opacity-0 transition-opacity duration-200 ease-linear buffering:animate-spin buffering:opacity-100"
        fill="none"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" />
        <circle
          className="opacity-75"
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          strokeWidth="10"
          pathLength="100"
          style={{
            strokeDasharray: 100,
            strokeDashoffset: 50,
          }}
        />
      </svg>
    </div>
  );
}

function ChaptersMenu({ chapters }: { chapters?: Chapter[] | null }) {
  if (!chapters || chapters.length === 0) return null;
  return (
    <MediaMenu className="relative inline-block">
      {/* Menu Button */}
      <MediaMenuButton
        className="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
        aria-label="Chapters"
      >
        <ChaptersIcon className="h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-data-[focus]:ring-4 group-data-[focus]:ring-primary" />
      </MediaMenuButton>
      {/* Menu Items */}
      <MediaChaptersMenuItems
        className="absolute bottom-full right-0 h-[var(--menu-height)] min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[thumbnails]:min-w-[300px] data-[resizing]:overflow-hidden sm:top-full"
        containerClass="w-full"
        chapterClass="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:m-1 data-[focus]:ring-primary border-b border-b-white/20 last:border-b-0 aria-checked:border-l-4 aria-checked:border-l-white"
        thumbnailClass="mr-3 min-w-[120px] min-h-[56px] max-w-[120px] max-h-[68px]"
        titleClass="text-white text-[15px] font-medium whitespace-nowrap"
        startTimeClass="inline-block py-px px-1 rounded-sm text-white text-xs font-medium bg-bg2 mt-1.5"
        durationClass="text-xs text-white/50 font-medium rounded-sm mt-1.5"
      />
    </MediaMenu>
  );
}
