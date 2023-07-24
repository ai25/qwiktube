import {
  Resource,
  component$,
  noSerialize,
  useComputed$,
  useContext,
  useResource$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeAction$, routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import { PipedVideo } from "~/types";
import {
  DBContext,
  InstanceContext,
  PlayerContext,
  PreferencesContext,
  getStorageValue,
  setStorageValue,
} from "../layout";
import VideoCard from "~/components/VideoCard";
import Description from "~/components/Description";
import { on } from "events";
import { useCookie } from "~/hooks/usePreferences";

export function extractVideoId(url: string): string {
  const id = url?.match("(?<=/)([^/]{11})(?=/)")?.[0];
  return id ?? "";
}
export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout: number } = { timeout: 800 }
) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    console.log("aborting");
    controller.abort(`Request exceeded timeout of ${timeout}ms.`);
  }, timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
export default component$(() => {
  const video = useSignal<PipedVideo>();
  const playerContext = useContext(PlayerContext);
  const route = useLocation();
  const v = useComputed$(() => route.url.searchParams.get("v"));
  const error = useSignal<{ name: string; message: string }>();
  const videoLoaded = useSignal(false);
  const preferences = useContext(PreferencesContext);
  const instance = useContext(InstanceContext);
  const db = useContext(DBContext);

  useVisibleTask$(() => {
    //eslint-disable-next-line qwik/valid-lexical-scope
    console.log("visible", db.value);
  });

  const vd = useResource$<any>(async ({ track, cleanup }) => {
    const id = track(() => v.value);
    const apiInstance = track(() => instance.value);
    console.log(id, apiInstance, "id instance");
    if (!id) return;
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    error.value = { name: "", message: "" };
    let data;

    console.log("fetching video", v.value);
    try {
      const res = await fetchWithTimeout(`${apiInstance}/streams/${id}`, {
        timeout: 8000,
        signal: abortController.signal,
      });
      console.log(res.status, res.statusText, "status");
      data = await res.json();
      return data;
      console.log(typeof data, "piped video");
    } catch (err) {
      console.log(err, "error while fetching video");
      error.value = {
        name: (err as Error).name,
        message: (err as Error).message,
      };
    }
  });

  function onResolved(data: any) {
    if (data?.error) {
      error.value = {
        name: data.error,
        message: data.message,
      };
      return;
    }
    video.value = data;
    console.log(video.value?.title, "title1", data?.title);
    const persistedVideo = getStorageValue("video", null, "json", "sessionStorage");
    if (!video.value) return;
    if (
      extractVideoId(video.value.thumbnailUrl) === extractVideoId(persistedVideo?.thumbnailUrl) &&
      document.querySelector("media-player")?.getAttribute("canplay") === "true"
    ) {
      console.log(
        "same video",
        extractVideoId(video.value.thumbnailUrl),
        extractVideoId(persistedVideo?.thumbnailUrl),
        document.querySelector("media-player")?.getAttribute("canplay")
      );

      return;
    }
    console.log("setting context value");
    playerContext.value = video.value;
    setStorageValue("video", JSON.stringify(video.value), "sessionStorage");
    console.log(video.value?.title, "title");
  }

  // useTask$(async ({ track }) => {
  //   if (!v.value) return;
  //   track(() => v.value);
  //   track(() =>preferences.value.instanceUrl);

  //   error.value = { name: "", message: "" };
  //   let data;

  //   console.log("fetching video", v.value);
  //   try {
  //     const res = await fetchWithTimeout(`${preferences.value.instanceUrl}/streams/${v.value}`, {timeout: 5000});
  //     console.log(res.status, res.statusText, "status");
  //     data = await res.json();
  //     console.log(data, "piped video");
  //   } catch (err) {
  //     console.log(err);
  //     error.value = {
  //       name: (err as Error).name,
  //       message: (err as Error).message,
  //     };
  //   }
  //   if (data?.error) {
  //     error.value = {
  //       name: data.error,
  //       message: data.message,
  //     };
  //     return;
  //   }
  //   video.value = data;
  //   console.log(video.value?.title, "title1", data?.title);
  //   console.log(data, "video", playerContext.value);
  //   const persistedVideo = getStorageValue(
  //     "video",
  //     null,
  //     "json",
  //     "sessionStorage"
  //   );
  //   if (!video.value) return;
  //   if (
  //     extractVideoId(video.value.thumbnailUrl) ===
  //       extractVideoId(persistedVideo?.thumbnailUrl) &&
  //     document.querySelector("media-player")?.getAttribute("canplay") === "true"
  //   ) {
  //     console.log(
  //       "same video",
  //       extractVideoId(video.value.thumbnailUrl),
  //       extractVideoId(persistedVideo?.thumbnailUrl),
  //       document.querySelector("media-player")?.getAttribute("canplay")
  //     );

  //     return;
  //   }
  //   console.log("setting context value");
  //   playerContext.value = video.value;
  //   setStorageValue("video", JSON.stringify(video.value), "sessionStorage");
  //   console.log(video.value?.title, "title");
  // });

  return (
    <div>
      <Resource
        value={vd}
        onResolved={(vdo) => {
          onResolved(vdo);
          return (
            <div class="min-h-full">
              {video.value && <Description video={video.value} />}
              <div q:slot="recommended" class="mx-2 relative">
                <div class="absolute">
                  {video.value?.relatedStreams?.map((stream) => {
                    return <VideoCard key={stream.url} v={stream} />;
                  })}
                </div>
              </div>
            </div>
          );
        }}
      />
      <div>{error.value?.message}</div>
      <div>{error.value?.name}</div>
      {/* <QPlayer video={video.value} isMiniPlayer={false} /> */}
    </div>
  );
});
