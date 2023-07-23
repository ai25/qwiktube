import {
  $,
  component$,
  createContextId,
  noSerialize,
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

import Header from "~/components/header/header";
import Footer from "~/components/footer/footer";
import { QPlayer } from "~/components/player";
import { PipedInstance, PipedVideo } from "~/types";
import exp from "constants";
import { extractVideoId, fetchWithTimeout } from "./watch";
import { srtToHtml } from "~/utils/ttml";
import usePreferences, { Preferences, useCookie } from "~/hooks/usePreferences";
import { IDBPDatabase, openDB } from "idb";
import VideoCard from "~/components/VideoCard";

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
    source === "localStorage" && testLocalStorage() ? localStorage.getItem(key) : sessionStorage.getItem(key);

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
async function fetchJson(url: string, params?: string[], options?: RequestInit) {
  if (params) {
    const newUrl = new URL(url);
    for (let param in params) newUrl.searchParams.set(param, params[param]);
  }
  return fetch(url, options)
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      return err as Error;
    });
}

export const useInstance = routeLoader$(async () => {
  return await fetchWithTimeout("https://piped-instances.kavin.rocks/", {
    timeout: 8000,
  })
    .then((res) => {
      console.log("INSTANCES", res);
      return res.json();
    })
    .catch((err) => {
      console.log("INSTANCES ERROR", err);
      return err as Error;
    });
});

export const useCookieLoader = routeLoader$(async ({ cookie }) => {
  const theme = cookie.get("theme") ?? { value: "monokai" };
  const instance = cookie.get("instance") ?? { value: "https://pipedapi.kavin.rocks" };
  return JSON.stringify({ theme, instance });
});

export const PlayerContext = createContextId<Signal<PipedVideo>>("player-context");
export const ThemeContext = createContextId<Signal<string>>("theme-context");
export const PageLoadingContext = createContextId<Signal<boolean>>("page-loading-context");
export const InstanceContext = createContextId<Signal<string>>("instance-context");
export const TranscriptContext = createContextId<Signal<string>>("transcript-context");

export const PreferencesContext = createContextId<Signal<Preferences>>("preferences-context");

export const DBContext = createContextId<Signal<IDBPDatabase<unknown>>>("db-context");

export default component$(() => {
  const video = useSignal<PipedVideo>();
  const preferences = usePreferences();
  const serverCookies = useCookieLoader();
  const cookies = JSON.parse(serverCookies.value);
  const theme = useSignal(cookies.theme.value);
  const instance = useSignal(cookies.instance.value);

  const pageLoading = useSignal(false);
  const transcript = useSignal<string>();
  const prefs = useComputed$(() => preferences);
  useContextProvider(PlayerContext, video);
  useContextProvider(ThemeContext, theme);
  useContextProvider(PageLoadingContext, pageLoading);
  useContextProvider(TranscriptContext, transcript);
  useContextProvider(PreferencesContext, prefs);
  useContextProvider(InstanceContext, instance);
  const instances = useInstance();

  const persistedVideo = useSignal<PipedVideo>();
  const route = useLocation();
  useVisibleTask$(
    () => {
      persistedVideo.value = getStorageValue("video", null, "json", "sessionStorage");
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

  const db = useSignal<IDBPDatabase<unknown> | undefined>();

  useVisibleTask$(async () => {
    if (typeof window === "undefined") return;
    const odb = await openDB("qwiktube", 1, {
      upgrade(db) {
        db.createObjectStore("watch_history");
      },
    });
    console.log("setting db visible");
    db.value = noSerialize(odb);
  });
  useContextProvider(DBContext, db);

  return (
    <div class={`${theme.value} bg-bg1 text-text1 selection:bg-accent2 selection:text-bg1`}>
      <div class="w-full h-1 ">
        {pageLoading.value && <div class="h-1 bg-primary transition-all duration-200" style={{ width: `${50}%` }} />}
      </div>
      <Header instances={instances.value} />
      <main>
        <div class="w-full h-full flex">
          <div class="w-full sm:w-[calc(100%-26rem)] max-h-full aspect-video">
            {video.value || persistedVideo.value ? (
              <QPlayer
                video={video.value ?? persistedVideo.value}
                progress={
                  prefs.value?.videos[extractVideoId(video.value?.thumbnailUrl ?? "")] ??
                  prefs.value?.videos[extractVideoId(persistedVideo.value?.thumbnailUrl ?? "")] ??
                  0
                }
                isMiniPlayer={true}
                setTranscript={$((t: string) => {
                  transcript.value = srtToHtml(t);
                })}
                // updateProgress={$((id: string, progress: number) => {
                //   console.log("update progress", id, progress, prefs.value);
                //   prefs.value.videos[id] = progress;
                // })}
                route={route}
                db={db.value}
              />
            ) : (
              <div class="flex justify-center items-center w-full aspect-video relative">
                <div class="absolute inset-0 z-50 flex items-center justify-center w-full h-full pointer-events-none">
                  <svg
                    class="w-24 h-24 text-white transition-opacity duration-200 ease-linear opacity-0 buffering:animate-spin buffering:opacity-100"
                    fill="none"
                    viewBox="0 0 120 120"
                    aria-hidden="true"
                  >
                    <circle class="opacity-25" cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" />
                    <circle
                      class="opacity-75"
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="10"
                      pathLength="100"
                      style={{
                        strokeDasharray: 100,
                        strokeDashoffset: 50,
                      }}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <Slot name="recommended" />
        </div>
        <div dangerouslySetInnerHTML={transcript.value}></div>
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
