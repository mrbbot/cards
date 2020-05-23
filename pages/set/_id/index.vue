<template>
  <div>
    <h1>{{ set.name }}</h1>
    <div v-for="card in set.cards" :key="card.id">
      <div v-html="card.title"></div>
      <h3 v-html="card.section"></h3>
      <div v-html="card.body"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { CardSet } from "~/api/services/db";

export default Vue.extend({
  async asyncData({ $http, params }): Promise<{ set: CardSet }> {
    return { set: await $http.$get(`/set/${params.id}`) };
  }
});
</script>
