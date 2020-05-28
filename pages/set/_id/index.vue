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
    store.commit("setNavbarTitle", set.name);
    if (set.cardCount === 0) {
      error({ statusCode: 200, message: "No cards in set" });
      return;
    }
    return { set };
  },
  head() {
    // @ts-ignore
    const name = this.set.name;
    return {
      // @ts-ignore
      title: name + " | Cards",
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
