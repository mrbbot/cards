import express from "express";
import cards from "./routes/cards";

const app = express();
app.disable("x-powered-by");

const api = express.Router();
api.use("/cards", cards);
app.use("/api", api);

// @ts-ignore
app.use(express.static(process.env.CARDS_PATH, { maxAge: "7d" }));

export default {
  path: "/",
  handler: app
};
