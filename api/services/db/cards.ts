import { pool } from "./index";

export interface Card {
  id: string;
  section: string;
  title: string;
  body: string;
  align?: string;
  rank?: number;
}

export interface CardSet {
  id: string;
  name: string;
  section: string;
  wip: boolean;
  cardCount: number;
  cards: Card[];
}

export interface CardSetSection {
  section: string;
  sets: CardSet[];
}

export async function getCardSets(): Promise<CardSetSection[]> {
  const res = await pool.query<CardSet>(
    "SELECT card_set.id, card_set.name, card_set.section, card_set.wip, COUNT(card.id) as card_count FROM card_set LEFT JOIN card on card_set.id = card.set_id GROUP BY card_set.id"
  );
  const grouped: { [key: string]: CardSet[] } = {};
  for (const set of res.rows) {
    if (!(set.section in grouped)) grouped[set.section] = [];
    set.cardCount = parseInt((set as any).card_count);
    delete (set as any).card_count;
    grouped[set.section].push(set);
  }
  const sections = Object.entries(grouped).map(([section, sets]) => {
    sets.sort((a, b) => a.name.localeCompare(b.name));
    return {
      section,
      sets
    } as CardSetSection;
  });
  sections.sort((a, b) => a.section.localeCompare(b.section));
  return sections;
}

export async function getCardSet(setId: string): Promise<CardSet | null> {
  const res = await pool.query<CardSet>(
    "SELECT name, section, wip FROM card_set WHERE id = $1",
    [setId]
  );
  if (res.rowCount === 0) return null;
  const set: CardSet = res.rows[0];
  const cardsRes = await pool.query<Card>(
    "SELECT id, section, title, body, align FROM card WHERE set_id = $1 ORDER BY set_id, ordering",
    [setId]
  );
  return {
    id: setId,
    name: set.name,
    section: set.section,
    wip: set.wip,
    cardCount: cardsRes.rowCount,
    cards: cardsRes.rows
  };
}

export async function searchCards(q: string): Promise<Card[]> {
  const res = await pool.query<Card>(
    "SELECT id, section, title, body, align, ts_rank(document, query) AS rank FROM card, plainto_tsquery($1) query WHERE document @@ query ORDER BY rank DESC LIMIT 50",
    [q]
  );
  return res.rows;
}
