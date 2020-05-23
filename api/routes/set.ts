import Router from "express-promise-router";
import { getCardSet } from "../services/db";

const router = Router();

router.get("/set/:setId", async (req, res) => {
  const set = await getCardSet(req.params.setId);
  if (!set) res.status(404);
  res.json(set);
});

export default router;
