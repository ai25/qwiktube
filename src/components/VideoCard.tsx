import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { RelatedStream } from "~/types";
import numeral from "numeral";
import Link from "./link";
import { DBContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";

export default component$(({ v }: { v: RelatedStream & { progress?: number } }) => {
  const db = useContext(DBContext);
  const video = useSignal(v);

  useVisibleTask$(async ({ track }) => {
    console.log(v, "v", video.value, "video");
    //eslint-disable-next-line qwik/valid-lexical-scope
    if (!db.value) return;
    //eslint-disable-next-line qwik/valid-lexical-scope
    const tx = db.value.transaction("watch_history", "readwrite");
    const store = tx.objectStore("watch_history");
    const val = await store.get(extractVideoId(video.value.thumbnail));
    console.log(val, "val");
    video.value.progress = val?.progress;
    //eslint-disable-next-line qwik/valid-lexical-scope
    track(() => db.value);
    track(() => v);
  });

  if (!video.value) return null;

  return (
    <div class={` flex w-96 max-w-xl flex-col items-center rounded-xl bg-bg1 p-4`}>
      <Link href={`${video.value.url}`} class=" flex aspect-video max-w-fit flex-col overflow-hidden rounded">
        {/* <p>{video.value.title}</p> */}
        {video.value.progress !== undefined && (
          <div class="relative h-0 w-0 bg-blue-400">
            <div class="absolute left-0 top-0 z-[1] bg-black/50 px-2 uppercase">Watched</div>
          </div>
        )}
        <img
          class={`cursor-pointer ${video.value.progress ? "opacity-50" : ""} `}
          src={video.value.thumbnail.replace("hqdefault", "mqdefault")}
          placeholder="blur"
          width={1920}
          height={1080}
          alt={video.value.title}
        />
        <div class="relative h-0 w-12 place-self-end text-sm lg:w-16 lg:text-base">
          <div class="absolute bottom-2 right-2 rounded bg-black/60 px-1">
            {numeral(video.value.duration).format("00:00:00").replace(/^0:/, "")}
          </div>
        </div>
        {!!video.value.progress && (
          <div class="relative h-0 w-full">
            <div
              style={{
                width: `clamp(0%, ${(video.value.progress / video.value.duration) * 100}%, 100%`,
              }}
              class="absolute bottom-0 h-1 bg-highlight"
            ></div>
          </div>
        )}
      </Link>
      <div class="mt-2 flex w-full flex-col">
        <div class="flex flex-col gap-2 pr-2">
          <Link href={video.value.url} class="w-fit max-w-fit break-inside-avoid text-lg leading-tight">
            {video.value.title}
          </Link>

          <div class="flex gap-2 text-text2">
            <div class="group mb-1 w-max underline ">
              <Link href={video.value.uploaderUrl || ""} class="flex max-w-max items-center gap-2">
                {video.value.uploaderAvatar && (
                  <img
                    src={video.value.uploaderAvatar}
                    width={32}
                    height={32}
                    class="rounded-full"
                    alt={video.value.uploaderName}
                  />
                )}
              </Link>
            </div>

            <div class="flex w-full flex-col">
              <Link href={video.value.uploaderUrl || ""}>
                <div class="peer w-fit text-sm">{video.value.uploaderName}</div>
              </Link>
              <div class="flex ">
                <div class="w-fit text-sm "> {numeral(video.value.views).format("0a").toUpperCase()} views</div>

                <div class="group w-fit pl-1 text-sm">
                  <div class=""> • {video.value.uploadedDate} </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
