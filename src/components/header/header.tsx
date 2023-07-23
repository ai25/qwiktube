import { component$, useContext, useSignal, useTask$, useVisibleTask$, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import {
  ThemeContext,
  InstanceContext,
  getStorageValue,
  setStorageValue,
  PreferencesContext,
  useCookieLoader,
} from "~/routes/layout";
import Link from "~/components/link";
import { PipedInstance } from "~/types";
import Select from "~/components/select";
import usePreferences, { Theme, useCookie } from "~/hooks/usePreferences";

export default component$(({ instances }: { instances?: PipedInstance[] | Error }) => {
  const pipedInstances = useSignal<PipedInstance[]>();
  const preferences = useContext(PreferencesContext);
  const theme = useContext(ThemeContext);
  const instance = useContext(InstanceContext);
  const [, setTheme] = useCookie("theme", "monokai");
  const [, setInstance] = useCookie("instance", "https://pipedapi.kavin.rocks");

  useVisibleTask$(() => {
    console.log(theme.value, "cookies");
    if (!instances || instances instanceof Error || (instances as PipedInstance[]).length < 1) {
      pipedInstances.value = getStorageValue("instances", [], "json", "localStorage");
      console.log("pipedInstances", pipedInstances.value);
      return;
    }

    console.log("pipedInstances2", pipedInstances.value);
    pipedInstances.value = instances as PipedInstance[];
    setStorageValue("instances", JSON.stringify(instances), "localStorage");
  });

  const dropdownRef = useSignal<HTMLDivElement>();
  return (
    <header>
      <div class="text-text1 flex gap-2 items-center m-2">
        <div>
          <Link href="/" title="qwik">
            <svg class="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.28 0 9.6 4.32 9.6 9.6 0 5.28-4.32 9.6-9.6 9.6-5.28 0-9.6-4.32-9.6-9.6 0-5.28 4.32-9.6 9.6-9.6zm-1.2 3.6c-.66 0-1.2.54-1.2 1.2v4.8c0 .66.54 1.2 1.2 1.2h2.4c.66 0 1.2-.54 1.2-1.2v-4.8c0-.66-.54-1.2-1.2-1.2h-2.4zm0 7.2c-.66 0-1.2.54-1.2 1.2v4.8c0 .66.54 1.2 1.2 1.2h2.4c.66 0 1.2-.54 1.2-1.2v-4.8c0-.66-.54-1.2-1.2-1.2h-2.4z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
        <Select
          name="theme"
          value={theme.value ?? ""}
          onChange$={(v) => {
            //eslint-disable-next-line qwik/valid-lexical-scope
            setTheme(v);
            theme.value = v;
          }}
          options={[
            { value: "monokai", label: "Monokai" },
            { value: "dracula", label: "Dracula" },
            { value: "kawaii", label: "Kawaii" },
            { value: "discord", label: "Discord" },
            { value: "github", label: "Github" },
          ]}
        />

        {pipedInstances.value && (
          <Select
            name="instance"
            value={
              pipedInstances.value?.find((i) => {
                let inst = i.api_url === instance.value;
                console.log(inst, i.api_url, instance.value);
                return inst;
              })?.name ?? `DOWN - ${instance.value}`
            }
            onChange$={(v) => {
              //eslint-disable-next-line qwik/valid-lexical-scope
              setInstance(v);
              instance.value = v;
            }}
            options={pipedInstances.value?.map((instance) => {
              return {
                value: instance.api_url,
                label: instance.name,
              };
            })}
          />
        )}
      </div>
    </header>
  );
});
