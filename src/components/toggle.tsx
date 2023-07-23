import { component$ } from "@builder.io/qwik";

export default component$<{ label: string; onChange$: () => void }>(({ label, onChange$ }) => {
  return (
    <label for={label} class="flex cursor-pointer items-center">
      <div class="relative">
        <input onChange$={onChange$} type="checkbox" id={label} class="peer sr-only" />
        <div class="peer-checked:ring-bg block h-8 w-14 rounded-full bg-bg1 ring-2 ring-bg2 focus:ring-2 focus:ring-primary peer-checked:bg-primary"></div>
        <div class="absolute left-1 top-1 h-6 w-6 rounded-full bg-bg2 shadow shadow-black/50 transition duration-200 peer-checked:translate-x-full peer-checked:bg-accent1"></div>
      </div>
    </label>
  );
});
