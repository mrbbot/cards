<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="workspaces-grid">
          <nuxt-link
            v-for="workspace in workspaces"
            :key="workspace.id"
            :to="'/workspace/' + workspace.id"
            class="workspace-card"
          >
            <h2 class="subtitle">{{ workspace.name }}</h2>
            <div class="workspaces-stacks-grid">
              <template v-for="stack in workspace.stacks">
                <p :key="stack.id + '-name'">{{ stack.name }}</p>
                <progress
                  :key="stack.id + '-progress'"
                  class="progress is-success is-marginless"
                  :value="stack.cardCount"
                  :max="workspace.cardCount"
                ></progress>
              </template>
            </div>
          </nuxt-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { CardWorkspace } from "~/api/services/db/workspaces";

interface AsyncData {
  workspaces: CardWorkspace[];
}

export default Vue.extend({
  middleware: "auth",
  async asyncData({ $axios, store }): Promise<AsyncData> {
    const res = await $axios.$get<CardWorkspace[]>("/api/workspaces");
    store.commit("setNavbarTitle", "Workspaces");
    return { workspaces: res };
  },
  head() {
    return {
      title: "Workspaces | Cards"
    };
  }
});
</script>

<style lang="sass">
@import "~bulma/sass/utilities/initial-variables"
@import "~bulma/sass/utilities/derived-variables"

.workspaces-grid
  display: grid
  grid-gap: 16px
  grid-template-columns: repeat(auto-fill, 105mm)
  justify-content: center
  .workspace-card
    display: block
    color: $text
    width: 105mm
    max-width: 105mm
    box-sizing: border-box
    padding: 5mm
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
    .workspaces-stacks-grid
      display: grid
      grid-gap: 16px
      grid-template-columns: auto 1fr
      align-items: center
</style>
