import { component$, useSignal, $ } from '@builder.io/qwik';
import numeral from "numeral";
import { PipedVideo } from "../types";
import Link from "./link";

export default component$(({ video }: { video: PipedVideo }) => {
  const isSubscribed = useSignal(false);
  function urlify(string: string) {
    if (!string) return "";
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    const emailRegex = /([\w-\\.]+@(?:[\w-]+\.)+[\w-]{2,4})/g;
    return string
      .replace(urlRegex, (url) => {
        if (url.endsWith("</a>") || url.endsWith("<a")) return url;
        return `<a href="${url}" target="_blank">${url}</a>`;
      })
      .replace(emailRegex, (email) => {
        return `<a href="mailto:${email}">${email}</a>`;
      });
  }
  function rewriteDescription(text: string) {
    return urlify(text)
      .replaceAll(
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm,
        "$1"
      )
      .replaceAll(
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm,
        "/watch?v=$1"
      )
      .replaceAll("\n", "<br>");
  }
  const expanded = useSignal(false);

  return (
    <div class="bg-bg1 p-4 mb-2 w-full overflow-hidden max-w-3xl break-before-auto">
      <div class="flex flex-col lg:flex-row gap-2 justify-between">
        <div class="flex flex-col gap-2 lg:w-2/3">
          <h1 class="text-xl sm:text-2xl font-bold ">{video?.title}</h1>
          <div class="mb-1  flex gap-4 justify-between sm:justify-start ">
            <div class="flex items-center gap-2 max-w-max text-sm sm:text-base">
              <Link href={`${video?.uploaderUrl}`}>
                <img
                  src={video?.uploaderAvatar}
                  width={42}
                  height={42}
                  alt={video?.uploader}
                  class="rounded-full"
                />
              </Link>
              <div class="flex flex-col items-center justify-start">
                <Link
                  href={`${video?.uploaderUrl}`}
                  class="w-fit flex items-center gap-2">
                  {video?.uploader}{" "}
                  {video?.uploaderVerified && (
                    <svg
                      class="w-4 h-4 "
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
                    </svg>
                  )}
                </Link>
                <div class="flex items-center w-full text-start text-xs sm:text-sm text-text2">
                  {numeral(video?.uploaderSubscriberCount)
                    .format("0a")
                    .toUpperCase()}{" "}
                  subscribers
                </div>
              </div>
            </div>
            <button
              onClick$={() => (isSubscribed.value = !isSubscribed.value)}
              class={`btn ${
                isSubscribed.value
                  ? "!bg-bg3 shadow-lg ring-1 !ring-navFooter ring-inset"
                  : ""
              } `}>
              Subscribe{isSubscribed.value && "d"}
            </button>
          </div>
        </div>
        <div class="flex lg:flex-col lg:justify-start lg:items-start items-center justify-between">
          <p class="">Published {video?.uploadDate}</p>
          <p class="">{numeral(video?.views).format("0,0")} views</p>
        </div>
      </div>
      <div class="flex bg-bg2 p-2 rounded-lg flex-col mt-1">
          <div tabIndex={-1} class={`min-w-0 break-words max-w-full  truncate ${expanded.value ? "": "max-h-12"}`} dangerouslySetInnerHTML={rewriteDescription(video?.description)} />
          <button onClick$={$(()=>{expanded.value = !expanded.value})} class="text-accent1 hover:underline text-sm text-center">Show {expanded.value ? "less" : "more"}</button>
      </div>
    </div>
  );
});
