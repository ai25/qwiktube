import { Slot, component$ } from "@builder.io/qwik";
import type { Chapter, PipedVideo, RelatedStream } from "~/types";
import "vidstack/icons";

interface PlayerSkinProps {
  video: PipedVideo | null | undefined;
  isMiniPlayer: boolean;
}
export default function PlayerSkin({ video, isMiniPlayer }: PlayerSkinProps) {
  return (
    <div
      class="pointer-events-none absolute inset-0 z-10 flex h-full flex-col justify-between text-white opacity-0 transition-opacity duration-200 ease-linear can-control:opacity-100"
      role="group"
      aria-label="Media Controls"
    >
      <div class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-black/50 from-5% via-transparent via-50% to-black/20 to-100%" />
      <media-gesture
        class="left-0 top-0 z-10 h-full w-full bg-green-500/50"
        event="pointerup"
        action="toggle:paused"
      ></media-gesture>
      <media-gesture class="left-0 top-0 h-full w-full" event="dblpointerup" action="toggle:fullscreen" />
      <media-gesture class="left-0 top-0 z-10 h-full w-1/5" event="dblpointerup" action="seek:-10" />
      <media-gesture class="right-0 top-0 z-10 h-full w-1/5" event="dblpointerup" action="seek:10" />
      <MediaControlGroup>
        <div class="z-10 flex w-full items-center justify-start truncate font-sans text-lg font-normal text-white">
          <p class="truncate">{video?.title}</p>
        </div>
        <div class="flex w-max items-center justify-end">
          <media-mute-button class="group peer flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary sm:hidden">
            <media-icon type="mute" class="hidden group-data-[volume=muted]:block" />
            <media-icon type="volume-low" class="hidden group-data-[volume=low]:block" />
            <media-icon type="volume-high" class="hidden group-data-[volume=high]:block" />
            <media-tooltip class="" style={{ transformOrigin: "50% 100%" }}>
              <span class="hidden not-muted:inline">Mute</span>
              <span class="hidden muted:inline">Unmute</span>
            </media-tooltip>
          </media-mute-button>
          <ChaptersMenu chapters={video?.chapters} />
          <SettingsMenu />
        </div>
      </MediaControlGroup>
      <div class="pointer-events-none flex min-h-[48px] w-full p-2 ">
        <BufferingIndicator />
      </div>
      {/* <div class="absolute inset-0 z-50 flex flex-col justify-center w-full h-full text-white transition-opacity duration-200 ease-linear pointer-events-none">
        <PlayIcon class="w-10 h-10 mx-auto" />
      </div> */}

      <div class="pointer-events-none flex w-full max-w-full shrink flex-col px-2 pb-2 can-control:pointer-events-auto">
        <div class="flex items-center">
          <media-time-slider
            class="group mx-2.5 flex h-10 w-full items-center"
            track-class="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-white/50 outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
            track-fill-class="live:bg-red-500 absolute top-1/2 left-0 z-20 h-1 w-[var(--slider-fill-percent)] -translate-y-1/2 bg-primary will-change-[width]"
            track-progress-class="absolute top-1/2 left-0 z-10 h-1 w-[var(--media-buffered-percent)] -translate-y-1/2 bg-white will-change-[width]"
            thumb-container-class="absolute top-0 left-[var(--slider-fill-percent)] z-20 h-full w-5 -translate-x-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]"
            thumb-class="absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity duration-150 ease-in group-data-[interactive]:opacity-100"
            chapters-class="relative flex items-center w-full h-full"
            chapter-container-class="flex items-center w-[var(--width)] h-full mr-0.5 last:mr-0"
            chapter-class="relative flex items-center w-full h-1"
          >
            <div
              slot="preview"
              class="absolute left-[var(--preview-left)] z-10 -translate-x-1/2 rounded px-4 pb-8 text-white/80 opacity-0 transition-opacity duration-200 ease-out group-data-[interactive]:opacity-100 group-data-[interactive]:ease-in"
            >
              <div class="relative flex flex-col items-center justify-center">
                <div class="absolute bottom-[-1.6rem] z-50 flex flex-col items-center justify-center gap-1 ">
                  <media-slider-value type="pointer" format="time" class="z-50 rounded shadow-sm " />
                  <div class="truncate rounded px-2 text-sm shadow-sm">
                    {/** @ts-ignore */}
                    <span part="chapter-title" />
                  </div>
                </div>
                <media-slider-video
                  src={video?.videoStreams.find((s) => s.bitrate < 400000)?.url}
                  onError={console.error}
                />
              </div>
            </div>
          </media-time-slider>
          <media-live-indicator class="flex h-10 w-10 items-center justify-center text-white not-live:hidden">
            <div class="rounded-sm bg-gray-400 px-1 py-px font-sans text-xs font-bold uppercase tracking-widest text-slate-800 live-edge:bg-red-500 live-edge:text-white">
              live
            </div>
          </media-live-indicator>
        </div>

        <div class="flex w-full max-w-full justify-between ">
          <div class="flex w-full min-w-0 items-center justify-start">
            <div class="flex w-full max-w-full items-center justify-start">
              <media-play-button
                class="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary"
                aria-label="Play"
              >
                <media-icon type="play" class="hidden ring-0 ended:hidden paused:block" />
                <media-icon type="pause" class="hidden ring-0 not-paused:block" />
                <media-icon type="replay" class="hidden ring-0 ended:block" />
                <media-tooltip class="" style={{ transformOrigin: "50% 100%" }}>
                  <span class="hidden paused:inline">Play</span>
                  <span class="hidden not-paused:inline">Pause</span>
                </media-tooltip>
              </media-play-button>
              <div class="peer flex min-w-0 max-w-[8rem] items-center sm:w-full">
                <media-mute-button class="group peer hidden h-10 w-10 min-w-0 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary sm:flex">
                  <media-icom type="volume-muted" class="hidden ring-0 group-data-[volume=muted]:block" />
                  <media-icon type="volume-low" class="hidden ring-0 group-data-[volume=low]:block" />
                  <media-icon type="volume-high" class="hidden ring-0 group-data-[volume=high]:block" />
                  <media-tooltip class="" style={{ transformOrigin: "50% 100%" }}>
                    <span class="hidden not-muted:inline">Mute</span>
                    <span class="hidden muted:inline">Unmute</span>
                  </media-tooltip>
                </media-mute-button>
                <media-volume-slider
                  class="group mr-0 hidden h-10 w-full  flex-1 origin-left -scale-x-0 items-center p-0 transition-all duration-200 data-[hocus]:scale-x-100  group-data-[hocus]:scale-x-100 peer-data-[hocus]:scale-x-100 sm:flex"
                  track-class="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-[#5a595a] outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                  track-fill-class="absolute top-1/2 left-0 z-20 h-1 w-[var(--slider-fill-percent)] -translate-y-1/2 bg-white will-change-[width]"
                  thumb-container-class="absolute top-0 left-[var(--slider-fill-percent)] z-20 h-full w-5 -translate-x-1/2 group-data-[dragging]:left-[var(--slider-pointer-percent)]"
                  thumb-class="absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity duration-150 ease-in group-data-[interactive]:opacity-100"
                >
                  <div class="left-[var(--preview-left)] " slot="preview">
                    <media-slider-value type="pointer" format="percent" />
                  </div>
                </media-volume-slider>
              </div>

              <div class="flex min-h-[48px] min-w-0 max-w-full items-center text-xs transition-all duration-200 peer-data-[hocus]:ml-2.5 sm:ml-[-4rem]">
                <media-time type="current" class="flex items-center px-1 text-sm text-white" />
                /
                <media-time type="duration" class="flex items-center px-1 text-sm text-white" />
                <div class="hidden items-center justify-start overflow-hidden sm:flex">
                  •{" "}
                  <span class="z-10 min-w-0 max-w-full truncate pl-1 font-sans text-sm font-normal text-white ">
                    {video?.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <media-play-button class="group flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary">
              <media-icon type="play" class="hidden paused:block" />
              <media-icon type="pause" class="hidden not-paused:block" />
              <media-tooltip class="" style={{ transformOrigin: "50% 100%" }}>
                <span class="hidden paused:inline">Play</span>
                <span class="hidden not-paused:inline">Pause</span>
              </media-tooltip>
            </media-play-button>
            <RecommendedVideosMenu videos={video?.relatedStreams} />
            <FullscreenButton />
          </div>
        </div>
      </div>
    </div>
  );
}

const FullscreenButton = component$(() => {
  return (
    <media-fullscreen-button class="group flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-primary">
      <media-icon type="fullscreen" class="hidden ring-0 not-fullscreen:block" />
      <media-icon type="fullscreen-exit" class="hidden ring-0 fullscreen:block" />
      <media-tooltip class="tooltip" style={{ transformOrigin: "50% 100%" }}>
        <span class="hidden not-fullscreen:inline">Enter Fullscreen</span>
        <span class="hidden fullscreen:inline">Exit Fullscreen</span>
      </media-tooltip>
    </media-fullscreen-button>
  );
});

const MediaControlGroup = component$(() => {
  return (
    <div class="pointer-events-none flex min-h-[48px] w-full items-center justify-between p-2 can-control:pointer-events-auto">
      <Slot />
    </div>
  );
});

function SettingsMenu() {
  return (
    <media-menu class="relative inline-block">
      <media-menu-button
        class="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
        aria-label="Settings"
      >
        <media-icon
          type="settings"
          class="h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-aria-expanded:rotate-90 group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
        />
      </media-menu-button>
      <media-menu-items class="absolute bottom-full right-0 h-[var(--menu-height)] min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[resizing]:overflow-hidden sm:top-full">
        <CaptionsMenu />
        <QualityMenu />
        <PlaybackRateMenu />
      </media-menu-items>
    </media-menu>
  );
}

const CaptionsMenu = component$(() => {
  return (
    <media-menu class="text-sm text-white">
      <CaptionsMenuButton />
      <media-captions-menu-items
        class="relative flex flex-col p-1 aria-hidden:hidden"
        radio-group-class="w-full"
        radio-class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
});

const CaptionsMenuButton = component$(() => {
  return (
    <media-menu-button class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon type="arrow-left" class="hidden h-4 w-4 group-aria-expanded:inline" />
      <media-icon type="closed-captions" class="h-6 w-6 group-aria-expanded:hidden" />
      <span class="ml-1.5">Captions</span>
      <span class="ml-auto text-white/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
});
const QualityMenu = component$(() => {
  return (
    <media-menu class="text-sm text-white">
      <QualityMenuButton />
      <media-quality-menu-items
        class="relative flex flex-col p-1 aria-hidden:hidden"
        radio-group-class="w-full"
        radio-class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-gray-500 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
});

const QualityMenuButton = component$(() => {
  return (
    <media-menu-button class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon type="arrow-left" class="hidden h-4 w-4 group-aria-expanded:inline" />
      <media-icon type="settings" class="h-6 w-6 group-aria-expanded:hidden" />
      <span class="ml-1.5">Quality</span>
      <span class="ml-auto text-white/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
});

const PlaybackRateMenu = component$(() => {
  return (
    <media-menu class="text-sm text-white">
      <PlaybackRateMenuButton />
      <media-playback-rate-menu-items
        class="relative flex flex-col p-1 aria-hidden:hidden"
        radio-group-class="w-full"
        radio-class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="rounded-full border-1 flex items-center justify-center w-2.5 h-2.5 mr-2 border-gray-500 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
});

const PlaybackRateMenuButton = component$(() => {
  return (
    <media-menu-button class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon type="arrow-left" class="hidden h-4 w-4 group-aria-expanded:inline" />
      <media-icon type="odometer" class="h-6 w-6 group-aria-expanded:hidden" />
      <span class="ml-1.5">Speed</span>
      <span class="ml-auto text-white/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-white/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
});

const RecommendedVideosMenu = component$(({ videos }: { videos?: RelatedStream[] }) => {
  return (
    <media-menu class="relative hidden fullscreen:inline-block ">
      <RecommendedVideosMenuButton />
      <media-menu-items class="absolute bottom-full right-0 h-[var(--menu-height)] max-h-96 min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[resizing]:overflow-hidden">
        {videos?.map((video, index) => (
          <div
            key={`player-${video.url}-${index}`}
            class="flex items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
          >
            <div class="h-9 w-16 shrink-0 rounded-md bg-bg1" style={{ backgroundImage: `url(${video.thumbnail})` }} />
            <div class="ml-2 flex grow flex-col">
              <div class="text-sm text-white">{video.title}</div>
              <div class="text-xs text-white/50">{video.uploaderName}</div>
            </div>
          </div>
        ))}
      </media-menu-items>
    </media-menu>
  );
});

function RecommendedVideosMenuButton() {
  return (
    <media-menu-button
      class="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
      aria-label="Recommended Videos"
    >
      <media-icon
        type="playlist"
        class="h-8 w-8 rounded-sm group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
      />
    </media-menu-button>
  );
}

const BufferingIndicator = component$(() => {
  return (
    <div class="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
      <svg
        class="h-24 w-24 text-white opacity-0 transition-opacity duration-200 ease-linear buffering:animate-spin buffering:opacity-100"
        fill="none"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" />
        <circle
          class="opacity-75"
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
});

function ChaptersMenu({ chapters }: { chapters?: Chapter[] | null }) {
  if (!chapters || chapters.length === 0) return null;
  return (
    <media-menu class="relative inline-block">
      {/* Menu Button */}
      <media-menu-button
        class="group flex h-10 w-10 items-center justify-center rounded-sm outline-none"
        aria-label="Chapters"
      >
        <media-icon
          type="chapters"
          class="h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
        />
      </media-menu-button>
      {/* Menu Items */}
      <media-chapters-menu-items
        class="absolute bottom-full right-0 h-[var(--menu-height)] min-w-[260px] overflow-y-auto rounded-lg bg-bg1/95 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in aria-hidden:pointer-events-none aria-hidden:bottom-0 aria-hidden:opacity-0 data-[thumbnails]:min-w-[300px] data-[resizing]:overflow-hidden sm:top-full"
        container-class="w-full"
        chapter-class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:m-1 data-[focus]:ring-primary border-b border-b-white/20 last:border-b-0 aria-checked:border-l-4 aria-checked:border-l-white"
        thumbnail-class="mr-3 min-w-[120px] min-h-[56px] max-w-[120px] max-h-[68px]"
        title-class="text-white text-[15px] font-medium whitespace-nowrap"
        start-time-class="inline-block py-px px-1 rounded-sm text-white text-xs font-medium bg-bg2 mt-1.5"
        duration-class="text-xs text-white/50 font-medium rounded-sm mt-1.5"
      />
    </media-menu>
  );
}
