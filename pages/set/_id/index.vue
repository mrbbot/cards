<template>
  <section class="section">
    <div class="container">
      <CardGrid :cards="set.cards" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { CardSet } from "~/api/services/db/cards";
import CardGrid from "~/components/CardGrid.vue";

export default Vue.extend({
  components: {
    CardGrid
  },
  validate({ params }): boolean {
    // file based required parameters don't seem to be working
    return !!params.id;
  },
  async asyncData({
    $axios,
    params,
    store,
    error
  }): Promise<{ set: CardSet } | undefined> {
    const res = await $axios.get<CardSet>(`/api/cards/sets/${params.id}`, {
      validateStatus: (status) => status === 200 || status === 404
    });
    if (res.status === 404) {
      error({ statusCode: 404, message: "Set not found" });
      return;
    }
    const set: CardSet = await res.data;
    store.commit("setNavbarTitle", set.name + (set.wip ? " (WIP)" : ""));
    return { set };
  },
  head() {
    // @ts-ignore
    const { name, wip } = this.set;
    return {
      title: name + (wip ? " (WIP)" : "") + " | Cards",
      meta: [
        {
          hid: "description",
          name: "description",
          content: `MrBBot's ${name} Flashcard Collection`
        }
      ]
    };
  }
});
</script>
