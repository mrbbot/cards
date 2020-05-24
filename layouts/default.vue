<template>
  <div>
    <nav class="navbar is-black">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" to="/"><strong>Cards</strong></nuxt-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <div v-if="navbarTitle" class="navbar-item">
            {{ navbarTitle }}
          </div>
        </div>
      </div>
    </nav>
    <nuxt />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  computed: mapState(["navbarTitle"])
});
</script>

<style lang="sass">
@import "~bulma/sass/utilities/_all"
@import "~bulma/sass/base/_all"

@import "~bulma/sass/elements/container"
@import "~bulma/sass/elements/icon"
@import "~bulma/sass/elements/table"

@import "~bulma/sass/form/shared"
@import "~bulma/sass/form/input-textarea"
@import "~bulma/sass/form/tools"

@import "~bulma/sass/components/navbar"

@import "~bulma/sass/layout/section"
</style>
