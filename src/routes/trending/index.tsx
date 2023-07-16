import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Link from "~/components/link";
import { TrendingStream } from "~/types";

export const useRouteLoader = routeLoader$(async ({ query, pathname }) => {
  const trending = await fetch(
    `https://pipedapi.kavin.rocks/trending?region=US`
  ).then((res) => {
    console.log("fetching");
    return res.json();
  });
  return trending;
});
export default component$(() => {
  const routeLoader = useRouteLoader();
  const trending = useSignal<TrendingStream[]>(routeLoader.value);
  const loading = useSignal(false);
  return (
    <>
      <div class="bg-red-300 flex flex-wrap gap-4 justify-center">
        {loading.value && (
          <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div class="text-white text-2xl">Loading...</div>
          </div>
        )}
        {trending.value.map((video) => {
          return (
            <div key={video.thumbnail} class="">
              <Link href={video.url} class="relative">
                <img
                  width={288}
                  height={162}
                  src={video.thumbnail.replace("hqdefault", "mqdefault")}
                  alt={video.title}
                  class="w-80 sm:w-72 h-full object-cover"
                />
                <div class="absolute bottom-0 right-0 p-2 bg-black bg-opacity-50 text-white">
                  <span class="text-xs">{video.duration}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
});
