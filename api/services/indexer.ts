import { parseAll } from "./parser";
import { pool } from "./db";

export default async function indexer(indexPath: string) {
  const cardSets = await parseAll(indexPath);

  const client = await pool.connect();
  try {
    const cardSetIdsRes = await client.query("SELECT id FROM card_set");
    const cardSetIdsSet = new Set<string>(
      cardSetIdsRes.rows.map((row) => row.id)
    );
    const cardIdsRes = await client.query("SELECT id FROM card");
    const cardIdsSet = new Set<string>(cardIdsRes.rows.map((row) => row.id));

    for (const cardSet of cardSets) {
      // eslint-disable-next-line no-console
      console.log(`Indexing ${cardSet.id}...`);
      cardSetIdsSet.delete(cardSet.id);

      await client.query("BEGIN");
      await client.query(
        "INSERT INTO card_set(id, name, section, wip) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section = EXCLUDED.section, wip = EXCLUDED.wip",
        [cardSet.id, cardSet.name, cardSet.section, cardSet.wip]
      );
      let i = 0;
      for (const card of cardSet.cards) {
        // eslint-disable-next-line no-console
        console.log(`  Indexing ${card.id}...`);
        cardIdsSet.delete(card.id);
        await client.query(
          `INSERT INTO card(id, set_id, section, title, body, ordering, document, align) VALUES ($1, $2, $3, $4, $5, $6, to_tsvector($7), $8) ON CONFLICT (id) DO UPDATE SET set_id = EXCLUDED.set_id, section = EXCLUDED.section, title = EXCLUDED.title, body = EXCLUDED.body, ordering = EXCLUDED.ordering, document = EXCLUDED.document, align = EXCLUDED.align`,
          [
            card.id,
            cardSet.id,
            card.section.html,
            card.title.html,
            card.body.html,
            i,
            card.section.text + ". " + card.title.text + ". " + card.body.text,
            card.align || ""
          ]
        );
        i++;
      }
    }

    // remove all deleted cards/card sets
    for (const deletedCardId of cardIdsSet) {
      // eslint-disable-next-line no-console
      console.log(`Deleting card ${deletedCardId}...`);
      await client.query("DELETE FROM card WHERE id = $1", [deletedCardId]);
    }
    for (const deletedCardSetId of cardSetIdsSet) {
      // eslint-disable-next-line no-console
      console.log(`Deleting set ${deletedCardSetId}...`);
      await client.query("DELETE FROM card_set WHERE id = $1", [
        deletedCardSetId
      ]);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}