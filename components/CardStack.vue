<template>
  <Drop
    class="card-stack"
    :class="{ 'has-drag-over': dragOver }"
    @dragover="dragOver = true"
    @dragleave="dragOver = false"
    @drop="onDrop"
  >
    <p class="card-stack-label for-top">{{ stack.name }}</p>
    <p class="card-stack-label for-bottom">
      {{ stack.cards.length }} card{{ stack.cards.length === 1 ? "" : "s" }}
    </p>
    <Drag
      v-if="topCard"
      :transfer-data="{ cardId: topCard.id, fromStackId: stack.id }"
      effect-allowed="move"
      class="card-stack-cards"
    >
      <Card :card="topCard" />
    </Drag>
  </Drop>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Drag, Drop } from "vue-drag-drop";
import Card from "~/components/Card.vue";
import { Card as CardModel } from "~/api/services/db/cards";
import { CardStack as CardStackModel } from "~/api/services/db/workspaces";

export default Vue.extend({
  name: "CardGrid",
  components: {
    Card,
    Drag,
    Drop
  },
  props: {
    stack: {
      type: Object,
      required: true
    } as PropOptions<CardStackModel>
  },
  data() {
    return {
      dragOver: false
    };
  },
  computed: {
    topCard(): CardModel {
      return this.stack.cards[this.stack.cards.length - 1];
    }
  },
  methods: {
    onDrop({ cardId, fromStackId }: { cardId: string; fromStackId: string }) {
      this.dragOver = false;
      // if we're not moving to the same stack
      if (fromStackId !== this.stack.id) {
        this.$emit("move", {
          cardId,
          fromStackId,
          targetStackId: this.stack.id
        });
      }
    }
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
  &.has-drag-over
    background-color: #F4F4F4
  .markdown-card, .card-stack-cards
    position: absolute
    width: 100%
    height: 100%
  .card-stack-label
    position: absolute
    left: 0
    &.for-top
      top: -32px
    &.for-bottom
      bottom: -32px
</style>
