<template>
  <div>
    <section class="section">
      <div class="container">
        <h2 class="subtitle">Workspace</h2>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  middleware: "auth",
  head() {
    return {
      title: "Workspace | Cards"
    };
  }
});
</script>

<style lang="sass"></style>
