<template>
  <div class="workspace">
    <div class="other-stacks">
      <CardStack
        v-for="stack in otherStacks"
        :key="stack.id"
        :stack="stack"
      ></CardStack>
    </div>
    <div class="default-stack">
      <CardStack :stack="defaultStack"></CardStack>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import CardStack from "~/components/CardStack.vue";
import {
  CardStack as CardStackModel,
  CardWorkspace as CardWorkspaceModel
} from "~/api/services/db/workspaces";

export default Vue.extend({
  components: {
    CardStack
  },
  async asyncData({
    $axios,
    params,
    store,
    error
  }): Promise<{ workspace: CardWorkspaceModel } | undefined> {
    const res = await $axios.get<CardWorkspaceModel>(
      `/api/workspaces/${params.id}`,
      {
        validateStatus: (status) => status === 200 || status === 404
      }
    );
    if (res.status === 404) {
      error({ statusCode: 404, message: "Workspace not found" });
      return;
    }
    const workspace: CardWorkspaceModel = await res.data;
    store.commit("setNavbarTitle", workspace.name);
    return { workspace };
  },
  computed: {
    defaultStack(): CardStackModel {
      // @ts-ignore
      return this.workspace.stacks[0];
    },
    otherStacks(): CardStackModel[] {
      // @ts-ignore
      return this.workspace.stacks.slice(1);
    }
  },
  head() {
    // @ts-ignore
    const { name } = this.workspace;
    return {
      title: name + " | Cards",
      meta: [
        {
          hid: "description",
          name: "description",
          content: `MrBBot's Flashcard Collection`
        }
      ]
    };
  }
});
</script>

<style lang="sass">
.workspace
  position: absolute
  top: 3.25rem
  left: 0
  bottom: 0
  right: 0
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  .other-stacks
    display: flex
    flex-direction: row
    margin-bottom: 32px
    .card-stack:not(:last-child)
      margin-right: 32px
</style>
