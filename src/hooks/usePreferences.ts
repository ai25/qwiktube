import {
  $,
  Signal,
  useComputed$,
  useOnDocument,
  useResource$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

const usePreferences = () => {
  const preferences = useStore<Preferences>({
    theme: "monokai",
    fontSize: 14,
    instanceUrl: "https://pipedapi.kavin.rocks",
    videos: {},
  });

  useVisibleTask$(
    () => {
      try {
        if (typeof window.localStorage === "undefined") {
          console.error("localStorage is not available");
          return;
        }
        console.debug("Loading preferences from localStorage, preferences are currently", preferences);
        const localStoragePreferences = localStorage.getItem("preferences");
        if (localStoragePreferences) {
          const parsed = JSON.parse(localStoragePreferences);
          if (parsed) {
            preferences.theme = parsed.theme ?? preferences.theme;
            preferences.fontSize = parsed.fontSize ?? preferences.fontSize;
            preferences.instanceUrl = parsed.instanceUrl ?? preferences.instanceUrl;
            preferences.videos = parsed.videos ?? preferences.videos;
          }
        }
      } catch (error) {
        console.error("Failed to load preferences from localStorage: ", error);
      }
    },
    { strategy: "document-ready" }
  );

  useVisibleTask$(
    ({ track }) => {
      track(() => preferences.theme);
      track(() => preferences.fontSize);
      track(() => preferences.instanceUrl);
      track(() => preferences.videos);
      try {
        console.debug("Saving preferences to localStorage, preferences are currently", preferences);
        if (typeof window.localStorage !== "undefined") {
          localStorage.setItem("preferences", JSON.stringify(preferences));
        }
      } catch (error) {
        console.error("Failed to save preferences to localStorage: ", error);
      }
    },
    { strategy: "document-ready" }
  );

  return preferences;
};

export default usePreferences;

const isBrowser = typeof window !== "undefined";

function stringifyOptions(options: Record<string, any> = {}): string {
  return Object.keys(options).reduce((acc, key) => {
    if (key === "days") {
      return acc;
    } else {
      if (options[key] === false) {
        return acc;
      } else if (options[key] === true) {
        return `${acc}; ${key}`;
      } else {
        return `${acc}; ${key}=${options[key]}`;
      }
    }
  }, "");
}

const setCookie = (name: string, value: string, options: Record<string, any>) => {
  if (!isBrowser) return;

  const optionsWithDefaults = {
    days: 7,
    path: "/",
    ...options,
  };

  const expires = new Date(Date.now() + optionsWithDefaults.days * 864e5).toUTCString();

  document.cookie =
    name + "=" + encodeURIComponent(value) + "; expires=" + expires + stringifyOptions(optionsWithDefaults);
};

const getCookie = (name: string, initialValue = "") => {
  return (
    (isBrowser &&
      document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, "")) ||
    initialValue
  );
};

export function useCookie(
  key: string,
  initialValue: string
): [Signal<string>, (value: string, options?: Record<string, any>) => void] {
  const item = useSignal(() => {
    return getCookie(key, initialValue);
  });

  const updateItem = $((value: string, options = {}) => {
    item.value = value;
    setCookie(key, value, options);
  });

  return [item, updateItem];
}

export interface Preferences {
  theme: Theme;
  fontSize: number;
  instanceUrl: string;
  videos: Record<string, number>;
}

export type Theme = "monokai" | "dracula" | "github" | "discord" | "kawaii";
