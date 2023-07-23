import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { RelatedStream } from "~/types";
import numeral from "numeral";
import Link from "./link";
import { DBContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";

export default component$(({ v }: { v: RelatedStream & {progress?: number} }) => {

  const db = useContext(DBContext);
  const video = useSignal(v);

  useVisibleTask$(async ({track}) => {
    console.log(v, "v",video.value, "video")
    if (!db.value) return;
    const tx = db.value.transaction("watch_history", "readwrite");
    const store = tx.objectStore("watch_history");
    const val = await store.get(extractVideoId(video.value.thumbnail));
    console.log(val, "val");
    video.value.progress = val?.progress;
    track(() => db.value);
    track(() => v);
  });

  if (!video.value) return null;
    

  return (
    <div
      class={` flex flex-col w-96 max-w-xl bg-bg1 rounded-xl px-4 p-4 items-center`}>
      <Link
        href={`${video.value.url}`}
        class=" flex flex-col max-w-fit aspect-video rounded overflow-hidden">
        {/* <p>{video.value.title}</p> */}
        {video.value.progress !== undefined && (
          <div class="relative w-0 h-0 bg-blue-400">
            <div class="absolute top-0 left-0 px-2 bg-black/50 uppercase z-[1]">
              Watched
            </div>
          </div>
        )}
        <img
          class={`cursor-pointer ${
            video.value.progress ? "opacity-50" : ""
          } `}
          src={video.value.thumbnail?.replace("hqdefault", "mqdefault")}
          placeholder="blur"
          width={1920}
          height={1080}
          alt={video.value.title}
        />
        <div class="relative w-12 h-0 text-sm place-self-end lg:w-16 lg:text-base">
          <div class="absolute px-1 bottom-2 right-2 bg-black/60 rounded">
            {numeral(video.value.duration)
              .format("00:00:00")
              .replace(/^0:/, "")}
          </div>
        </div>
        {!!video.value.progress && (
          <div class="relative w-full h-0">
            <div
              style={{
                 width: `clamp(0%, ${(video.value.progress / video.value.duration) * 100}%, 100%`,
              }}
              class="absolute bottom-0 h-1 bg-highlight"></div>
          </div>
        )}
      </Link>
      <div class="flex flex-col w-full mt-2">
        <div class="pr-2 flex flex-col gap-2">
          <Link
            href={video.value.url}
            class="leading-tight text-lg w-fit max-w-fit break-inside-avoid">
            {video.value.title}
          </Link>

          <div class="flex text-text2 gap-2">
            <div class="mb-1 underline group w-max ">
              <Link
                href={video.value.uploaderUrl || ""}
                class="flex items-center gap-2 max-w-max">
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

            <div class="flex flex-col w-full">
                <Link href={video.value.uploaderUrl || ""} >
              <div class="text-sm w-fit peer">{video.value.uploaderName}</div>
              </Link>
              <div class="flex ">
                <div class="text-sm w-fit ">
                  {" "}
                  {numeral(video.value.views).format("0a").toUpperCase()} views
                </div>

                <div class="pl-1 text-sm w-fit group">
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
