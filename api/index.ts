import express from "express";
import set from "./routes/set";

const app = express();
app.disable("x-powered-by");

const api = express.Router();
api.use(set);
app.use("/api", api);

// @ts-ignore
app.use(express.static(process.env.CARDS_PATH, { maxAge: "7d" }));

export default {
  path: "/",
  handler: app
};
