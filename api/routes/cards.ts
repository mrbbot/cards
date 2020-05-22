import Router from "express-promise-router";

const router = Router();

router.get("/cards/*", (req, res) => {
  res.json({ hello: req.params[0] });
});

export default router;
