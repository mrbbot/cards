<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="field">
          <p class="control has-icons-left has-icons-right">
            <!--suppress HtmlFormInputWithoutLabel -->
            <input
              v-model="query"
              class="input"
              type="text"
              placeholder="Search Cards"
            />
            <span class="icon is-small is-left">
              <SearchIcon />
            </span>
            <span v-show="searching" class="icon is-small is-right is-spinning">
              <RefreshCwIcon />
            </span>
          </p>
        </div>
        <CardGrid v-if="query" :cards="foundCards" />
        <table
          v-else
          class="table is-fullwidth is-hoverable is-striped for-sets"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Cards</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="section of sections">
              <tr :key="section.id">
                <th colspan="3">{{ section.section }}</th>
              </tr>
              <nuxt-link
                v-for="set of section.sets"
                :key="set.id"
                :to="'/set/' + set.id"
                tag="tr"
              >
                <td>{{ set.name }}</td>
                <td>{{ set.cardCount }}</td>
                <td>
                  {{ set.cardCount === 0 ? "🚨" : set.wip ? "📚️️️" : "✅" }}
                  &nbsp;
                  {{
                    set.cardCount === 0
                      ? "Not Started"
                      : set.wip
                      ? "Work in Progress"
                      : "Complete"
                  }}
                </td>
              </nuxt-link>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { SearchIcon, RefreshCwIcon } from "vue-feather-icons";
import CardGrid from "~/components/CardGrid.vue";
import { Card, CardSetSection } from "~/api/services/db";

export default Vue.extend({
  components: {
    SearchIcon,
    RefreshCwIcon,
    CardGrid
  },
  middleware({ store }) {
    store.commit("setNavbarTitle");
  },
  async asyncData({ $http }): Promise<{ sections: CardSetSection[] }> {
    return { sections: await $http.$get(`/sets`) };
  },
  data() {
    return {
      query: "",
      searching: false,
      foundCards: [] as Card[]
    };
  },
  watch: {
    query(newQuery) {
      this.searching = false;
      this.foundCards = [];
      if ((this as any).queryDebounceHandle) {
        clearTimeout((this as any).queryDebounceHandle);
      }
      if (newQuery === "") return;
      this.searching = true;
      (this as any).queryDebounceHandle = setTimeout(async () => {
        this.foundCards = await this.$http.$get<Card[]>("/search", {
          searchParams: { q: newQuery }
        });
        this.searching = false;
      }, 500);
    }
  }
});
</script>

<style lang="sass">
.table.for-sets
  td
    cursor: pointer

.is-spinning
  animation: spinning 1s infinite linear

@keyframes spinning
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)
</style>
