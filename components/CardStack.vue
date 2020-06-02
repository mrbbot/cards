<template>
  <Drop
    class="card-stack"
    :class="{ 'has-drag-over': dragOver }"
    @dragover="dragOver = true"
    @dragleave="dragOver = false"
    @drop="onDrop"
  >
    <p class="card-stack-meta top left">{{ stack.name }}</p>
    <p class="card-stack-meta bottom left">
      {{ stack.cards.length }} card{{ stack.cards.length === 1 ? "" : "s" }}
    </p>
    <div class="card-stack-meta bottom right">
      <IconButton @click="$emit('action', action)">
        <ArrowDownIcon v-if="action === 'move'" size="16" />
        <ShuffleIcon v-else-if="action === 'shuffle'" size="16" />
      </IconButton>
    </div>
    <Drag
      v-if="topCard"
      :transfer-data="{ cardId: topCard.id, fromStackId: stack.id }"
      effect-allowed="move"
      class="card-stack-cards"
    >
      <Card :key="topCard.id" :card="topCard" />
    </Drag>
  </Drop>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Drag, Drop } from "vue-drag-drop";
import { ArrowDownIcon, ShuffleIcon } from "vue-feather-icons";
import Card from "~/components/Card.vue";
import IconButton from "~/components/IconButton.vue";
import { Card as CardModel } from "~/api/services/db/cards";
import { CardStack as CardStackModel } from "~/api/services/db/workspaces";

export default Vue.extend({
  name: "CardGrid",
  components: {
    Drag,
    Drop,
    ArrowDownIcon,
    ShuffleIcon,
    Card,
    IconButton
  },
  props: {
    stack: {
      type: Object,
      required: true
    } as PropOptions<CardStackModel>,
    action: {
      type: String,
      default: "move",
      validator(value: any): boolean {
        return value === "move" || value === "shuffle";
      }
    } as PropOptions<"move" | "shuffle">
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
  .card-stack-meta
    position: absolute
    &.top
      bottom: calc(100% + 8px)
    &.left
      left: 0
    &.bottom
      top: calc(100% + 8px)
    &.right
      right: 0
</style>
