import consola from "consola";
import { parseAll } from "./parser";
import { Card, CardSet, pool } from "./db";

export default async function indexer(indexPath: string) {
  const cardSets = await parseAll(indexPath);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const cardSetIdsRes = await client.query<CardSet>(
      "SELECT id FROM card_set"
    );
    const cardSetIdsSet = new Set<string>(
      cardSetIdsRes.rows.map((row) => row.id)
    );
    const cardIdsRes = await client.query<Card>("SELECT id FROM card");
    const cardIdsSet = new Set<string>(cardIdsRes.rows.map((row) => row.id));

    for (const cardSet of cardSets) {
      consola.info(`Indexing ${cardSet.id}...`);
      cardSetIdsSet.delete(cardSet.id);

      await client.query(
        "INSERT INTO card_set(id, name, section, wip) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section = EXCLUDED.section, wip = EXCLUDED.wip",
        [cardSet.id, cardSet.name, cardSet.section, cardSet.wip]
      );
      let i = 0;
      for (const card of cardSet.cards) {
        // consola.info(`  Indexing ${card.id}...`);
        cardIdsSet.delete(card.id);
        await client.query(
          "INSERT INTO card(id, set_id, section, title, body, ordering, document, align) " +
            "VALUES ($1, $2, $3, $4, $5, $6, setweight(to_tsvector($7), 'C') || setweight(to_tsvector($8), 'A') || setweight(to_tsvector($9), 'B'), $10) " +
            "ON CONFLICT (id) DO " +
            "UPDATE SET " +
            "set_id = EXCLUDED.set_id, " +
            "section = EXCLUDED.section, " +
            "title = EXCLUDED.title, " +
            "body = EXCLUDED.body, " +
            "ordering = EXCLUDED.ordering, " +
            "document = EXCLUDED.document, " +
            "align = EXCLUDED.align",
          [
            card.id,
            cardSet.id,
            card.section.html,
            card.title.html,
            card.body.html,
            i,
            card.section.text,
            card.title.text,
            card.body.text,
            card.align || ""
          ]
        );
        i++;
      }
    }

    // remove all deleted cards/card sets
    for (const deletedCardId of cardIdsSet) {
      consola.info(`Deleting card ${deletedCardId}...`);
      await client.query("DELETE FROM card WHERE id = $1", [deletedCardId]);
    }
    for (const deletedCardSetId of cardSetIdsSet) {
      consola.info(`Deleting set ${deletedCardSetId}...`);
      await client.query("DELETE FROM card_set WHERE id = $1", [
        deletedCardSetId
      ]);
    }

    await client.query("COMMIT");

    consola.success("Indexed!");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
