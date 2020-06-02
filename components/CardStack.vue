<template>
  <div class="card-stack">
    <p class="card-stack-label">{{ stack.name }}</p>
    <Draggable :list="stack.cards" group="cards" class="card-stack-cards">
      <Card
        v-for="(card, i) in stack.cards"
        v-show="i >= stack.cards.length - 2"
        :key="card.id"
        :card="card"
      />
    </Draggable>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import Draggable from "vuedraggable";
import Card from "~/components/Card.vue";
import { CardStack as CardStackModel } from "~/api/services/db/workspaces";

export default Vue.extend({
  name: "CardGrid",
  components: {
    Card,
    Draggable
  },
  props: {
    stack: {
      type: Object,
      required: true
    } as PropOptions<CardStackModel>
  }
});
</script>

<style lang="sass">
.card-stack
  position: relative
  width: 115mm
  height: 84mm
  box-sizing: border-box
  padding: 5mm
  border: 1px dashed #AAAAAA
  .markdown-card, .card-stack-cards
    position: absolute
    width: 100%
    height: 100%
  .card-stack-label
    position: absolute
    top: -24px
    left: 0
</style>
