import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import VideoCard from "~/components/VideoCard";
import Link from "~/components/link";
import type { TrendingStream } from "~/types";

export const useRouteLoader = routeLoader$(async ({ query, pathname }) => {
  const trending = await fetch(`https://pipedapi.kavin.rocks/trending?region=US`)
    .then((res) => {
      console.log("fetching");
      return res.json();
    })
    .catch((err) => {
      console.log("error", err);
      return err as Error;
    });
  return trending;
});
export default component$(() => {
  const routeLoader = useRouteLoader();
  const trending = useSignal<TrendingStream[]>(routeLoader.value);
  const loading = useSignal(false);
  return (
    <>
      <div class="flex min-h-full flex-wrap justify-center gap-4 bg-bg1">
        {loading.value && (
          <div class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
            <div class="text-2xl text-white">Loading...</div>
          </div>
        )}
        {trending.value.map((video) => {
          return <VideoCard key={video.url} v={video} />;
        })}
      </div>
    </>
  );
});
