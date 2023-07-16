import { component$, useContext, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
} from "@builder.io/qwik-city";
import { QPlayer } from "~/components/player";
import { PipedVideo } from "~/types";
import { PlayerContext, getStorageValue, setStorageValue } from "../layout";

export function extractVideoId(url: string): string {
  const id = url?.match("(?<=/)([^/]{11})(?=/)")?.[0];
  return id ?? "";
}

export default component$(() => {
  const video = useSignal<PipedVideo>();
  const playerContext = useContext(PlayerContext);
  const route = useLocation();
  const v = route.url.searchParams.get("v");
  const error = useSignal<{name:string, message:string}>();
  const videoLoaded = useSignal(false);


  useVisibleTask$(
    async () => {
      let data;
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/streams/${v}`);
        data = await res.json();
        console.log(data, "data");
      } catch (err) {
        error.value = {
          name: (err as Error).name,
          message: (err as Error).message,
        }
      }
      if (data?.error) {
        error.value = {
          name: data.error,
          message: data.message,
        }
        return;
      }
      video.value = data;
      console.log(data, "video", playerContext.value);
      const persistedVideo = getStorageValue(
        "video",
        null,
        "json",
        "sessionStorage"
      );
      if (!video.value) return;
      if (
        extractVideoId(video.value.thumbnailUrl) ===
          extractVideoId(persistedVideo?.thumbnailUrl) &&
        document.querySelector("video")
      ) {
        console.log(
          "same video",
          extractVideoId(video.value.thumbnailUrl),
          extractVideoId(persistedVideo?.thumbnailUrl)
        );

        return;
      }
      console.log("setting context value");
      playerContext.value = video.value;
      setStorageValue("video", JSON.stringify(video.value), "sessionStorage");
    },
    {
      strategy: "document-ready",
    }
  );

  return <div>
    <div>{error.value?.message}</div>
    <div>{error.value?.name}</div>
  {
    video.value?.relatedStreams?.map((stream) => {
      return (
        <div class="flex justify-center">
          {stream.title}
        </div>
      );
    })
  }
  </div>;
});
