import { component$ } from "@builder.io/qwik";

export default component$<{ label: string; onChange$: () => void }>(
  ({ label, onChange$ }) => {
    return (
      <label for={label} class="flex items-center cursor-pointer">
        <div class="relative">
          <input
            onChange$={onChange$}
            type="checkbox"
            id={label}
            class="sr-only peer"
          />
          <div class="block bg-bg1 ring-2 ring-bg2 peer-checked:ring-bg peer-checked:bg-primary w-14 h-8 rounded-full focus:ring-2 focus:ring-primary"></div>
          <div class="peer-checked:translate-x-full absolute left-1 top-1 bg-bg2 peer-checked:bg-accent1 shadow shadow-black/50 w-6 h-6 rounded-full transition duration-200"></div>
        </div>
      </label>
    );
  }
);
