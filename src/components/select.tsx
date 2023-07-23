import type { PropFunction, QwikChangeEvent } from "@builder.io/qwik";
import { $, Slot, component$, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useClickOutside } from "~/hooks/useClickOutside";

export default component$(
  ({
    onChange$,
    value,
    options,
    name,
  }: {
    onChange$: (value: string) => void;
    value: string;
    options?: { value: string; label: string }[];
    name: string;
  }) => {
    const ref = useSignal<HTMLDivElement>();
    const dropdownRef = useSignal<HTMLDivElement>();
    const expanded = useSignal(false)
    const expand = $(() => {expanded.value=true})
    const close = $(() => {expanded.value = false})

    return (
      <div onFocus$={$(console.log("FOCUS"))} class="relative">
        <button
ref={ref} onBlur$={close}  
        id={`dropdownDefaultButton-${name}`}
          onClick$={() => {
            expanded.value ? close() : expand()
          }}
          class="text-bg1 relative bg-primary hover:bg-highlight focus:ring-4 focus:outline-none focus:ring-accent1 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
          type="button"
        >
          {value}
          <svg
            class="w-2.5 h-2.5 ml-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <div
          onFocus$={$(()=>console.log("focus"))}
          onBlur$={$(()=>{
            console.log("blurred")
            close()
          })}
          ref={dropdownRef}
          class={`z-10 ${expanded.value? "" : "hidden"} bg-bg1/70 backdrop-blur-sm divide-y absolute divide-accent1 rounded-lg shadow max-w-[20rem] `}
        >
          <ul class="py-2 text-sm" aria-labelledby={`dropdownDefaultButton-${name}`}>
            {options?.map((option) => (
              <li
              key={`${name}-${option.value}`}
              >
                <button
                  onClick$={() => onChange$(option.value)}
                  class="block px-4 py-2 hover:bg-bg1 w-full text-left"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);
