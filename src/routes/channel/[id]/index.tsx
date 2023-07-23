import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useChannelLoader = routeLoader$(
    async ({params} ) => {
      console.log("PARAMS", params);
      const id = params.id
      console.log("ID", id);
      if(!id) return;
        const channel = await fetch(
            `https://pipedapi.kavin.rocks/channel/${id}`
        ).then((res) => res.json()).catch((err) => {
            console.log("CHANNEL ERROR", err);
            return err as Error;
        });
        return { channel };
        }
    );
export default component$(() => {
  const channel = useChannelLoader();
  console.log("CHANNEL", channel.value);
  useVisibleTask$(() => {
    console.log("CHANNEL", channel.value);
  }, {strategy: "document-ready"});
  return (
    <div>
      <div class="flex justify-center place-items-center">
        <img
          height="48"
          width="48"
          class="rounded-full m-1"
          src={channel.value?.channel.avatarUrl}
        />
        <h1>{channel.value?.channel.name}</h1>
        {/* <svg class="ml-1.5 !text-3xl" v-if="channel.verified" icon="check" /> */}
      </div>
      <img width={843} height={145} src={channel.value?.channel.bannerUrl} class="w-full pb-1.5" loading="lazy" />
      <p class="whitespace-pre-wrap">
        <span v-html="purifyHTML(rewriteDescription(channel.description))" />
      </p>

      <button class="btn" onClick$={() => {}}>
        Subscribe
      </button>

      <a
        aria-label="RSS feed"
        title="RSS feed"
        role="button"
        v-if="channel.id"
        href="`${apiUrl()}/feed/unauthenticated/rss?channels=${channel.id}`"
        target="_blank"
        class="btn flex-col mx-3">
        {/* <font-awesome-icon icon="rss" /> */}
      </a>

      {/* <WatchOnYouTubeButton :link="`https://youtube.com/channel/${this.channel.id}`" /> */}

      <div class="flex mt-4 mb-2">
        {/* <button
                v-for="(tab, index) in tabs"
                :key="tab.name"
                class="btn mr-2"
                @click="loadTab(index)"
                :class="{ active: selectedTab == index }"
            >
                <span v-text="tab.translatedName"></span>
            </button> */}
      </div>

      <hr />

      <div class="video-grid">
        {/* <ContentItem
                v-for="item in contentItems"
                :key="item.url"
                :item="item"
                height="94"
                width="168"
                hide-channel
            /> */}
      </div>
    </div>
  );
});
