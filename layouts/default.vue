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
