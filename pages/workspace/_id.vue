<template>
  <div class="workspace">
    <div class="other-stacks">
      <CardStack
        v-for="stack in otherStacks"
        :key="stack.id"
        :stack="stack"
        @move="onMove"
        @action="onMoveStack(stack.id, defaultStack.id)"
      ></CardStack>
    </div>
    <div class="default-stack">
      <CardStack
        :stack="defaultStack"
        action="shuffle"
        @move="onMove"
        @action="onShuffle(defaultStack.id)"
      ></CardStack>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import shuffle from "lodash/shuffle";
import CardStack from "~/components/CardStack.vue";
import {
  CardStack as CardStackModel,
  CardWorkspace as CardWorkspaceModel
} from "~/api/services/db/workspaces";

export default Vue.extend({
  middleware: "auth",
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
  methods: {
    async onMove({
      cardId,
      fromStackId,
      targetStackId
    }: {
      cardId: string;
      fromStackId: string;
      targetStackId: string;
    }) {
      // @ts-ignore
      const workspace = this.workspace as CardWorkspaceModel;

      // get from and target stacks
      const fromStack = workspace.stacks.find((s) => s.id === fromStackId);
      if (!fromStack) return;
      const targetStack = workspace.stacks.find((s) => s.id === targetStackId);
      if (!targetStack) return;

      // 1. get card from top of from stack
      const fromStackTop = fromStack.cards[fromStack.cards.length - 1];
      // check this matches expected card
      if (fromStackTop.id !== cardId) {
        // eslint-disable-next-line no-console
        console.warn("Top of from stack different from dragged card!");
        return;
      }

      // 2. remove card from top of from stack
      fromStack.cards.splice(fromStack.cards.length - 1, 1);

      // 3. add card to top of target stack
      targetStack.cards.push(fromStackTop);

      await this.$axios.$patch(`/api/workspaces/${workspace.id}/move`, {
        cardId,
        fromStackId,
        targetStackId
      });
    },
    async onMoveStack(fromStackId: string, targetStackId: string) {
      // @ts-ignore
      const workspace = this.workspace as CardWorkspaceModel;

      // get from and target stacks
      const fromStack = workspace.stacks.find((s) => s.id === fromStackId);
      if (!fromStack) return;
      const targetStack = workspace.stacks.find((s) => s.id === targetStackId);
      if (!targetStack) return;

      // move all cards from from stack to target stack
      targetStack.cards.push(...fromStack.cards);
      fromStack.cards = [];

      await this.$axios.$patch(`/api/workspaces/${workspace.id}/move`, {
        fromStackId,
        targetStackId
      });
    },
    async onShuffle(stackId: string) {
      // @ts-ignore
      const workspace = this.workspace as CardWorkspaceModel;
      const stack = workspace.stacks.find((s) => s.id === stackId);
      if (!stack) return;

      stack.cards = shuffle(stack.cards);

      const cardIdOrder = stack.cards.map((c) => c.id);

      await this.$axios.$patch(`/api/workspaces/${workspace.id}/order`, {
        stackId,
        cardIdOrder
      });
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
    margin-bottom: 64px
    .card-stack:not(:last-child)
      margin-right: 24px
</style>
