<template>
  <div class="markdown-card" @click="front = !front">
    <template v-if="front">
      <div class="corner" v-html="card.section"></div>
      <div class="markdown-body" v-html="card.title"></div>
    </template>
    <div
      v-else
      class="markdown-body"
      :style="{ textAlign: card.align }"
      v-html="card.body"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Card } from "~/api/services/db/cards";

export default Vue.extend({
  name: "Card",
  props: {
    card: {
      type: Object,
      required: true
    } as PropOptions<Card>
  },
  data() {
    return {
      front: true
    };
  }
});
</script>

<style lang="sass">
@import "~github-markdown-css"
//noinspection CssUnknownTarget
@import "katex/dist/katex.css"

.markdown-card
  position: relative
  width: 105mm
  max-width: 105mm
  height: 74mm
  max-height: 74mm
  overflow: hidden
  box-sizing: border-box
  padding: 5mm
  text-align: center
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
  cursor: pointer
  display: flex
  align-items: center
  justify-content: center
  .markdown-body h1,
  .markdown-body h2
    border-bottom: none
  .markdown-body p:only-child .katex-display
    margin: 0
  .corner
    position: absolute
    bottom: 2.5mm
    left: 2.5mm
    right: 2.5mm
    text-align: left
    color: #24292e
</style>
