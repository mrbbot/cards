/* eslint-disable camelcase */
import { Card } from "./cards";
import { pool } from "./index";

export interface CardStack {
  id: string;
  name: string;
  cardCount?: number;
  cards: Card[];
}

export interface CardWorkspace {
  id: string;
  name: string;
  cardCount?: number;
  stacks: CardStack[];
}

export async function getWorkspaces(
  username: string
): Promise<CardWorkspace[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");

    const workspacesRes = await client.query<{
      workspace_id: string;
      workspace_name: string;
      card_count: string;
    }>(
      "SELECT cw.id AS workspace_id, cw.name AS workspace_name, COUNT(cwsc.card_id) AS card_count " +
        "FROM card_workspace cw " +
        "LEFT JOIN card_workspace_stack_card cwsc on cw.id = cwsc.workspace_id " +
        "WHERE cw.username = $1 " +
        "GROUP BY cw.id, cw.name " +
        "ORDER BY cw.name",
      [username]
    );
    const workspaceIndices: { [key: string]: number } = {};
    const workspaces = workspacesRes.rows.map((workspace, i) => {
      workspaceIndices[workspace.workspace_id] = i;
      return {
        id: workspace.workspace_id,
        name: workspace.workspace_name,
        cardCount: parseInt(workspace.card_count),
        stacks: []
      } as CardWorkspace;
    });

    const stacksRes = await client.query<{
      workspace_id: string;
      stack_id: string;
      stack_name: string;
      card_count: string;
    }>(
      "SELECT cw.id AS workspace_id, cws.id AS stack_id, cws.name AS stack_name, COUNT(cwsc.card_id) AS card_count " +
        "FROM card_workspace cw " +
        "JOIN card_workspace_stack cws on cw.id = cws.workspace_id " +
        "LEFT JOIN card_workspace_stack_card cwsc on cws.id = cwsc.stack_id " +
        "WHERE cw.username = $1 " +
        "GROUP BY cw.id, cws.id, cws.name " +
        "ORDER BY cw.id, cws.ordering",
      [username]
    );
    for (const stack of stacksRes.rows) {
      // @ts-ignore
      workspaces[workspaceIndices[stack.workspace_id]].stacks.push({
        id: stack.stack_id,
        name: stack.stack_name,
        cardCount: parseInt(stack.card_count)
      });
    }

    await client.query("COMMIT");
    return workspaces;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getWorkspace(
  username: string,
  workspaceId: string
): Promise<CardWorkspace | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");

    const workspacesRes = await client.query<{
      name: string;
    }>(
      "SELECT cw.name " +
        "FROM card_workspace cw " +
        "WHERE cw.username = $1 AND cw.id = $2",
      [username, workspaceId]
    );
    if (workspacesRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const stacksRes = await client.query<CardStack>(
      "SELECT cws.id, cws.name " +
        "FROM card_workspace cw " +
        "JOIN card_workspace_stack cws on cw.id = cws.workspace_id " +
        "WHERE cw.username = $1 AND cws.workspace_id = $2 " +
        "ORDER BY cws.ordering",
      [username, workspaceId]
    );
    const stackIndices: { [key: string]: number } = {};
    const stacks = stacksRes.rows.map((stack, i) => {
      stackIndices[stack.id] = i;
      return {
        id: stack.id,
        name: stack.name,
        cards: []
      } as CardStack;
    });

    interface CardInStack extends Card {
      stack_id: string;
    }
    const cardsRes = await client.query<CardInStack>(
      "SELECT cws.id AS stack_id, c.id, c.section, c.title, c.body, c.align " +
        "FROM card_workspace cw " +
        "JOIN card_workspace_stack cws on cw.id = cws.workspace_id " +
        "JOIN card_workspace_stack_card cwsc on cws.id = cwsc.stack_id " +
        "JOIN card c on cwsc.card_id = c.id " +
        "WHERE cw.username = $1 AND cws.workspace_id = $2 " +
        "ORDER BY cws.ordering, cwsc.ordering",
      [username, workspaceId]
    );
    for (const card of cardsRes.rows) {
      const stackId = card.stack_id;
      delete card.stack_id;
      // @ts-ignore
      stacks[stackIndices[stackId]].cards.push(card);
    }

    await client.query("COMMIT");
    return {
      id: workspaceId,
      name: workspacesRes.rows[0].name,
      stacks
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function addSetToWorkspace(
  username: string,
  setId: string,
  workspaceId: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. get default stack and total cards
    const defaultStackRes = await client.query<{
      stack_id: string;
      card_count: string;
    }>(
      "SELECT cws.id AS stack_id, COUNT(cwsc.card_id) AS card_count " +
        "FROM card_workspace cw " +
        "JOIN card_workspace_stack cws on cw.id = cws.workspace_id " +
        "LEFT JOIN card_workspace_stack_card cwsc on cws.id = cwsc.stack_id " +
        "WHERE cw.username = $1 AND cws.workspace_id = $2 " +
        "GROUP BY cws.id, cws.ordering " +
        "ORDER BY cws.ordering " +
        "LIMIT 1",
      [username, workspaceId]
    );
    if (defaultStackRes.rowCount === 0) {
      await client.query("ROLLBACK");
      // couldn't find default stack for given workspace and user
      return false;
    }
    const defaultStack = defaultStackRes.rows[0];

    // 2. insert cards at the end of the stack
    await client.query(
      "INSERT INTO card_workspace_stack_card (workspace_id, stack_id, card_id, ordering) " +
        "(" +
        "    SELECT $1 AS workspace_id, $2 AS stack_id, c.id AS card_id, ((row_number() OVER ()) + $3 - 1) AS ordering " +
        "    FROM card c " +
        "    WHERE c.set_id = $4" +
        ")" +
        "ON CONFLICT DO NOTHING",
      [workspaceId, defaultStack.stack_id, defaultStack.card_count, setId]
    );

    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function moveCardToStack(
  username: string,
  workspaceId: string,
  cardId: string,
  fromStackId: string,
  targetStackId: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. get number of cards in target stack
    const stackRes = await client.query<{ card_count: string }>(
      "SELECT cws.id, COUNT(cwsc.card_id) AS card_count " +
        "FROM card_workspace cw " +
        "JOIN card_workspace_stack cws on cw.id = cws.workspace_id " +
        "LEFT JOIN card_workspace_stack_card cwsc on cws.id = cwsc.stack_id " +
        "WHERE cw.username = $1 AND cws.workspace_id = $2 AND cws.id = $3 " +
        "GROUP BY cws.id",
      [username, workspaceId, targetStackId]
    );
    if (stackRes.rowCount === 0) {
      await client.query("ROLLBACK");
      // couldn't find stack for given workspace, user and stack id
      return false;
    }
    const stackCardCount = parseInt(stackRes.rows[0].card_count);

    // 2. change card to be in target stack
    await client.query(
      "UPDATE card_workspace_stack_card " +
        "SET stack_id = $1, ordering = $2 " +
        "WHERE workspace_id = $3 AND stack_id = $4 AND card_id = $5",
      [targetStackId, stackCardCount, workspaceId, fromStackId, cardId]
    );

    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
