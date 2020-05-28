import Router from "express-promise-router";
import isString from "lodash/isString";
import {
  auth,
  AuthenticatedRequest,
  login,
  logout,
  refresh
} from "../services/db/users";

const router = Router();

router.post("/login", async (req, res) => {
  if (!(isString(req.body.username) && isString(req.body.password))) {
    res.status(400);
    res.json(false);
    return;
  }

  const loginRes = await login(req.body.username, req.body.password);
  if (loginRes === null) {
    res.status(404);
    res.json(false);
    return;
  }

  res.json(loginRes);
});

router.post("/refresh", async (req, res) => {
  if (!isString(req.body.refreshToken)) {
    res.status(400);
    res.json(false);
    return;
  }

  const refreshRes = await refresh(req.body.refreshToken);
  if (refreshRes === null) {
    res.status(400);
    res.json(false);
    return;
  }

  res.json(refreshRes);
});

router.get("/me", auth, (req, res) => {
  res.json((req as AuthenticatedRequest).user);
});

router.post("/logout", auth, async (req, res) => {
  await logout((req as AuthenticatedRequest).user.username);
  res.json(true);
});

export default router;
