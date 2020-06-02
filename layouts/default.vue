<template>
  <div>
    <nav class="navbar is-black">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" to="/"><strong>Cards</strong></nuxt-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <div v-if="navbarTitle" class="navbar-item">{{ navbarTitle }}</div>
        </div>
        <div class="navbar-end">
          <div
            v-if="auth.loggedIn"
            class="navbar-item has-dropdown is-hoverable"
          >
            <div class="navbar-link">{{ auth.user.username }}</div>
            <div class="navbar-dropdown is-right">
              <nuxt-link class="navbar-item" to="/workspace/">
                Workspaces
              </nuxt-link>
              <a class="navbar-item" @click="reindex">Reindex</a>
              <hr class="navbar-divider" />
              <a class="navbar-item" @click="logout">Logout</a>
            </div>
          </div>
          <nuxt-link v-else class="navbar-item" to="/login">Login</nuxt-link>
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
  computed: mapState(["navbarTitle", "auth"]),
  methods: {
    async reindex() {
      this.$nuxt.$loading.start();
      await this.$axios.get("/api/cards/reindex");
      this.$nuxt.$loading.finish();
      window.location.reload();
    },
    async logout() {
      await this.$auth.logout();
    }
  }
});
</script>
