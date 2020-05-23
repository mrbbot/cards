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
  async asyncData({ $http, params, store }): Promise<{ set: CardSet }> {
    const set: CardSet = await $http.$get(`/cards/${params.id}`);
    store.commit("setNavbarTitle", set.name);
    return { set };
  }
});
</script>
