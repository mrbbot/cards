import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export interface Card {
  id: string;
  section: string;
  title: string;
  body: string;
  align?: string;
}

export interface CardSet {
  id: string;
  name: string;
  section: string;
  wip: boolean;
  cards: Card[];
}

export async function getCardSet(setId: string): Promise<CardSet | null> {
  const setRes = await pool.query(
    "SELECT name, section, wip FROM card_set WHERE id = $1",
    [setId]
  );
  if (setRes.rowCount === 0) return null;
  const set: CardSet = setRes.rows[0];
  const cardsRes = await pool.query(
    "SELECT id, section, title, body, align FROM card WHERE set_id = $1 ORDER BY set_id, ordering",
    [setId]
  );
  return {
    id: setId,
    name: set.name,
    section: set.section,
    wip: set.wip,
    cards: cardsRes.rows
  };
}
