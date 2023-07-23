import { Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export function useClickOutside(ref: Signal<HTMLElement | undefined | null> ) {
    const visible = useSignal(false)
  useVisibleTask$(({track, cleanup}) => {
    track(() => ref.value);

    function handleClickOutside(event: MouseEvent) {
        console.log("handleClickOutside", ref.value?.contains(event.target as Node));
      if (ref.value && !ref.value.contains(event.target as Node)) {
        console.log("You clicked outside of me!");
        visible.value = false;
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    cleanup(() => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
        }
    );
  });
  return {visible}
}
