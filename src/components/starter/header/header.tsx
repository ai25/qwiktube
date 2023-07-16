import { component$, useContext } from "@builder.io/qwik";
import { QwikLogo } from "../icons/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { ThemeContext } from "~/routes/layout";
import Link from "~/components/link";

export default component$(() => {
  const theme = useContext(ThemeContext);
  return (
    <header>
      <div class="text-primary">
        <div>
          <Link href="/" title="qwik">
            <QwikLogo height={50} width={143} />
          </Link>
        </div>
        <ul>
          <li>
            <Link class="text-blue-500" href="/demo/flower">
              Docs
            </Link>
          </li>
          <li>
            <Link href="/demo/todolist">Examples</Link>
          </li>
          <li>
            <Link href="/trending">Trending</Link>
          </li>
        </ul>
        <div class={`${theme.value} w-full h-full`}>
          <select
            class="absolute top-0 right-0 input"
            onChange$={(e) => (theme.value = e.target.value)}>
            <option value="monokai">Monokai</option>
            <option value="dracula">Dracula</option>
            <option value="kawaii">Kawaii</option>
            <option value="discord">Discord</option>
            <option value="github">Github</option>
          </select>
        </div>
      </div>
    </header>
  );
});
