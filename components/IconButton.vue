<template>
  <div class="icon-button" @click="$emit('click')">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "IconButton"
});
</script>

<style lang="sass">
.icon-button
  width: 24px
  height: 24px
  padding: 4px
  border-radius: 12px
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  &:hover
    background-color: #F4F4F4
</style>
