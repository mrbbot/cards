<template>
  <div>
    <section class="section">
      <div class="container for-login">
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <!--suppress HtmlFormInputWithoutLabel -->
            <input
              v-model="username"
              class="input"
              type="text"
              placeholder="Username"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <!--suppress HtmlFormInputWithoutLabel -->
            <input
              v-model="password"
              class="input"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button
              class="button is-fullwidth is-link"
              :class="{ 'is-loading': loggingIn }"
              :disabled="loggingIn"
              @click="login"
            >
              Login
            </button>
          </div>
        </div>

        {{ errorText }}
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  auth: "guest",
  middleware: "auth",
  data() {
    return {
      username: "",
      password: "",
      loggingIn: false,
      errorText: ""
    };
  },
  methods: {
    async login() {
      if (!this.loggingIn) {
        this.loggingIn = true;
        this.$nuxt.$loading.start();
        try {
          await this.$auth.loginWith("local", {
            data: {
              username: this.username,
              password: this.password
            }
          });
        } catch (e) {
          // TODO: display this error nicely
          // eslint-disable-next-line no-console
          console.error(e);
        } finally {
          this.$nuxt.$loading.finish();
          this.loggingIn = false;
        }
      }
    }
  },
  head() {
    return {
      title: "Login | Cards"
    };
  }
});
</script>

<style lang="sass">
.container.for-login
  max-width: 400px
</style>
