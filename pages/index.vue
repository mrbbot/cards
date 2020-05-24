<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="field">
          <p class="control has-icons-left">
            <!--suppress HtmlFormInputWithoutLabel -->
            <input
              v-model="query"
              class="input"
              type="text"
              placeholder="Press enter to search cards"
              @keydown="onQueryKeyDown"
            />
            <span class="icon is-small is-left">
              <SearchIcon />
            </span>
          </p>
        </div>
        <CardGrid v-if="$route.query.q" :cards="results" />
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
import { SearchIcon } from "vue-feather-icons";
import CardGrid from "~/components/CardGrid.vue";
import { Card, CardSetSection } from "~/api/services/db";

interface AsyncData {
  query: string;
  sections: CardSetSection[];
  results: Card[];
}

export default Vue.extend({
  components: {
    SearchIcon,
    CardGrid
  },
  async asyncData({ $http, query, store }): Promise<AsyncData> {
    const data: AsyncData = {
      query: query.q?.toString() || "",
      sections: [],
      results: []
    };
    if (data.query) {
      data.results = await $http.$get<Card[]>("/api/search", {
        searchParams: { q: data.query }
      });
      store.commit("setNavbarTitle", "Search");
    } else {
      data.sections = await $http.$get(`/api/sets`);
      store.commit("setNavbarTitle");
    }

    return data;
  },
  watchQuery: true,
  methods: {
    onQueryKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        this.$router.push({
          name: "index",
          query: {
            // @ts-ignore
            q: this.query || undefined
          }
        });
      }
    }
  },
  head() {
    return {
      // @ts-ignore
      title: this.query ? "Search | Cards" : "Cards"
    };
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
