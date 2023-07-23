import { component$, useSignal, $ } from "@builder.io/qwik";
import numeral from "numeral";
import type { PipedVideo } from "../types";
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
      .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
      .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm, "/watch?v=$1")
      .replaceAll("\n", "<br>");
  }
  const expanded = useSignal(false);

  return (
    <div class="mb-2 w-full max-w-3xl break-before-auto overflow-hidden bg-bg1 p-4">
      <div class="flex flex-col justify-between gap-2 lg:flex-row">
        <div class="flex flex-col gap-2 lg:w-2/3">
          <h1 class="text-xl font-bold sm:text-2xl ">{video.title}</h1>
          <div class="mb-1  flex justify-between gap-4 sm:justify-start ">
            <div class="flex max-w-max items-center gap-2 text-sm sm:text-base">
              <Link href={`${video.uploaderUrl}`}>
                <img src={video.uploaderAvatar} width={42} height={42} alt={video.uploader} class="rounded-full" />
              </Link>
              <div class="flex flex-col items-center justify-start">
                <Link href={`${video.uploaderUrl}`} class="flex w-fit items-center gap-2">
                  {video.uploader}{" "}
                  {video.uploaderVerified && (
                    <svg class="h-4 w-4 " xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
                    </svg>
                  )}
                </Link>
                <div class="flex w-full items-center text-start text-xs text-text2 sm:text-sm">
                  {numeral(video.uploaderSubscriberCount).format("0a").toUpperCase()} subscribers
                </div>
              </div>
            </div>
            <button
              onClick$={() => (isSubscribed.value = !isSubscribed.value)}
              class={`btn ${isSubscribed.value ? "!bg-bg3 shadow-lg ring-1 ring-inset !ring-navFooter" : ""} `}
            >
              Subscribe{isSubscribed.value && "d"}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between lg:flex-col lg:items-start lg:justify-start">
          <p class="">Published {video.uploadDate}</p>
          <p class="">{numeral(video.views).format("0,0")} views</p>
        </div>
      </div>
      <div class="mt-1 flex flex-col rounded-lg bg-bg2 p-2">
        <div
          tabIndex={-1}
          class={`min-w-0 max-w-full truncate  break-words ${expanded.value ? "" : "max-h-12"}`}
          dangerouslySetInnerHTML={rewriteDescription(video.description)}
        />
        <button
          onClick$={$(() => {
            expanded.value = !expanded.value;
          })}
          class="text-center text-sm text-accent1 hover:underline"
        >
          Show {expanded.value ? "less" : "more"}
        </button>
      </div>
    </div>
  );
});
