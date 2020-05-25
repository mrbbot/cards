<template>
  <section class="section">
    <div class="container">
      <CardGrid :cards="set.cards" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { CardSet } from "~/api/services/db";
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
    $http,
    params,
    store,
    error
  }): Promise<{ set: CardSet } | undefined> {
    const res = await $http.get(`/api/cards/sets/${params.id}`, {
      throwHttpErrors: false
    });
    if (res.status === 404) {
      error({ statusCode: 404, message: "Set not found" });
      return;
    }
    const set: CardSet = await res.json();
    store.commit("setNavbarTitle", set.name);
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
