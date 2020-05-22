import express from "express";
import cards from "./routes/cards";

const app = express();

app.use(cards);

export default {
  path: "/api",
  handler: app
};
