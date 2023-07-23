import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import VideoCard from "~/components/VideoCard";
import Link from "~/components/link";
import { TrendingStream } from "~/types";

export const useRouteLoader = routeLoader$(async ({ query, pathname }) => {
  const trending = await fetch(
    `https://pipedapi.kavin.rocks/trending?region=US`
  ).then((res) => {
    console.log("fetching");
    return res.json();
  }).catch((err) => {
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
      <div class="bg-bg1 min-h-full flex flex-wrap gap-4 justify-center">
        {loading.value && (
          <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div class="text-white text-2xl">Loading...</div>
          </div>
        )}
        {trending.value.map((video) => {
          return (
            <VideoCard key={video.url} v={video} />
          );
        })}
      </div>
    </>
  );
});
