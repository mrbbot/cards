<template>
  <div class="card-grid">
    <Card v-for="card of cards" :key="card.id" :card="card" />
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Card as CardModel } from "~/api/services/db";
import Card from "~/components/Card.vue";

export default Vue.extend({
  name: "CardGrid",
  components: {
    Card
  },
  props: {
    cards: {
      type: Array,
      required: true
    } as PropOptions<CardModel[]>
  }
});
</script>

<style lang="sass">
.card-grid
  display: grid
  grid-gap: 16px
  grid-template-columns: repeat(auto-fill, 105mm)
  justify-content: center
</style>
