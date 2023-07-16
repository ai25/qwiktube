import { Slot, component$, useContext } from "@builder.io/qwik";
import { Link, LinkProps } from "@builder.io/qwik-city";
import { PageLoadingContext } from "~/routes/layout";

export default component$((props:LinkProps) => {
    const loadingContext = useContext(PageLoadingContext)
    return <Link onClick$={() => loadingContext.value = true} {...props}>
        <Slot />
    </Link>
})