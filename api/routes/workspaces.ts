import Router from "express-promise-router";
import isString from "lodash/isString";
import { auth, AuthenticatedRequest } from "../services/db/users";
import {
  getWorkspaces,
  addSetToWorkspace,
  getWorkspace
} from "../services/db/workspaces";

const router = Router();

router.get("/", auth, async (req, res) => {
  res.json(await getWorkspaces((req as AuthenticatedRequest).user.username));
});

router.get("/:workspaceId", auth, async (req, res) => {
  const workspaceRes = await getWorkspace(
    (req as AuthenticatedRequest).user.username,
    req.params.workspaceId
  );
  if (workspaceRes === null) {
    res.status(404);
    res.json(false);
    return;
  }
  res.json(workspaceRes);
});

router.put("/:workspaceId/add", auth, async (req, res) => {
  if (!isString(req.body.set)) {
    res.status(400);
    res.json(false);
    return;
  }

  const addRes = await addSetToWorkspace(
    (req as AuthenticatedRequest).user.username,
    req.body.set,
    req.params.workspaceId
  );
  if (!addRes) {
    res.status(404);
    res.json(false);
    return;
  }

  res.json(addRes);
});

export default router;
