import Router from "express-promise-router";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import { auth, AuthenticatedRequest } from "../services/db/users";
import {
  getWorkspaces,
  addSetToWorkspace,
  getWorkspace,
  moveCardToStack,
  moveStackToStack,
  setStackOrder
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

router.patch("/:workspaceId/move", auth, async (req, res) => {
  if (!(isString(req.body.fromStackId) && isString(req.body.targetStackId))) {
    res.status(400);
    res.json(false);
    return;
  }

  const updateRes = isString(req.body.cardId)
    ? await moveCardToStack(
        (req as AuthenticatedRequest).user.username,
        req.params.workspaceId,
        req.body.cardId,
        req.body.fromStackId,
        req.body.targetStackId
      )
    : await moveStackToStack(
        (req as AuthenticatedRequest).user.username,
        req.params.workspaceId,
        req.body.fromStackId,
        req.body.targetStackId
      );
  if (!updateRes) {
    res.status(404);
    res.json(false);
    return;
  }

  res.json(true);
});

router.patch("/:workspaceId/order", auth, async (req, res) => {
  if (
    !(
      isString(req.body.stackId) &&
      isArray(req.body.cardIdOrder) &&
      req.body.cardIdOrder.every((cardId: any) => isString(cardId))
    )
  ) {
    res.status(400);
    res.json(false);
    return;
  }

  const updateRes = await setStackOrder(
    (req as AuthenticatedRequest).user.username,
    req.params.workspaceId,
    req.body.stackId,
    req.body.cardIdOrder
  );
  if (!updateRes) {
    res.status(400);
    res.json(false);
    return;
  }

  res.json(true);
});

export default router;
