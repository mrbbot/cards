import Router from "express-promise-router";
import { getCardSet, getCardSets, searchCards } from "../services/db";
import indexer from "../services/indexer";

const router = Router();

router.get("/reindex", async (_req, res) => {
  // @ts-ignore
  await indexer(process.env.CARDS_PATH);
  res.redirect("/");
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
