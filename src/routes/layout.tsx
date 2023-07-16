import {
  component$,
  createContextId,
  Signal,
  Slot,
  useComputed$,
  useContextProvider,
  useSignal,
  useStyles$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "~/components/starter/header/header";
import Footer from "~/components/starter/footer/footer";
import { QPlayer } from "~/components/player";
import { PipedVideo } from "~/types";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

function testLocalStorage() {
  try {
    if (window.localStorage !== undefined) localStorage;
    return true;
  } catch {
    return false;
  }
}
export function setStorageValue(
  key: string,
  value: string,
  storage: "sessionStorage" | "localStorage" = "localStorage"
) {
  if (typeof window === "undefined") return;
  if (!testLocalStorage()) return;
  switch (storage) {
    case "localStorage":
      localStorage.setItem(key, value);
      break;
    case "sessionStorage":
      sessionStorage.setItem(key, value);
      break;
    default:
      throw new Error(`Invalid storage: ${storage}`);
  }
}
export function getStorageValue(
  key: string,
  defaultVal: any,
  type: "boolean" | "string" | "number" | "json" = "string",
  source: "localStorage" | "sessionStorage"
) {
  if (typeof window === "undefined") return defaultVal;

  let urlValue = new URLSearchParams(window.location.search).get(key);
  let storageValue =
    source === "localStorage" && testLocalStorage()
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);

  let value = urlValue !== null ? urlValue : storageValue;

  if (value !== null) {
    switch (type) {
      case "boolean":
        switch (String(value).toLowerCase()) {
          case "true":
          case "1":
          case "on":
          case "yes":
            return true;
          default:
            return false;
        }
      case "string":
        return value;
      case "number":
        return Number(value);
      case "json":
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error(e);
          return defaultVal;
        }
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  } else {
    return defaultVal;
  }
}

export const PlayerContext =
  createContextId<Signal<PipedVideo>>("player-context");
export const ThemeContext = createContextId<Signal<string>>("theme-context");
export const PageLoadingContext = createContextId<Signal<boolean>>(
  "page-loading-context"
);

export default component$(() => {
  const video = useSignal<PipedVideo>();
  const theme = useSignal("monokai");
  const pageLoading = useSignal(false);
  useContextProvider(PlayerContext, video);
  useContextProvider(ThemeContext, theme);
  useContextProvider(PageLoadingContext, pageLoading);
  const persistedVideo = useSignal<PipedVideo>();
  const route = useLocation();
  useVisibleTask$(
    () => {
      persistedVideo.value = getStorageValue(
        "video",
        null,
        "json",
        "sessionStorage"
      );
      console.log("upadting page loading in the browser", persistedVideo.value);
    },
    { strategy: "document-ready" }
  );
  useVisibleTask$(
    ({ track }) => {
      track(() => route.url.pathname);
      pageLoading.value = false;
    },
    { strategy: "document-idle" }
  );

  return (
    <div class={theme}>
      <div class="w-full h-1 ">
        {pageLoading.value && (
          <div
            class="h-1 bg-highlight transition-all duration-200"
            style={{ width: `${50}%` }}
          />
        )}
      </div>
      <Header />
      <main>
        <QPlayer
          video={video.value ?? persistedVideo.value}
          isMiniPlayer={getStorageValue(
            "isMiniPlayer",
            false,
            "boolean",
            "sessionStorage"
          )}
        />
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
