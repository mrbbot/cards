import Router from "express-promise-router";
import { getCardSet, getCardSets, searchCards } from "../services/db/cards";
import indexer from "../services/indexer";
import { auth } from "../services/db/users";

const router = Router();

router.get("/reindex", auth, async (_req, res) => {
  // @ts-ignore
  await indexer(process.env.CARDS_PATH);
  res.json(true);
});

router.get("/sets", async (_req, res) => {
  res.json(await getCardSets());
});

router.get("/sets/:setId", async (req, res) => {
  const set = await getCardSet(req.params.setId);
  if (!set) res.status(404);
  res.json(set);
});

router.get("/search", async (req, res) => {
  const q = req.query.q?.toString().trim();
  if (!q || q === "") {
    res.json([]);
    return;
  }
  res.json(await searchCards(q));
});

export default router;
