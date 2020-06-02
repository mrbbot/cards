import express from "express";
import bodyParser from "body-parser";
import cards from "./routes/cards";
import users from "./routes/users";
import workspaces from "./routes/workspaces";

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());

const api = express.Router();
api.use("/cards", cards);
api.use("/users", users);
api.use("/workspaces", workspaces);
app.use("/api", api);

// @ts-ignore
app.use(express.static(process.env.CARDS_PATH, { maxAge: "7d" }));

export default {
  path: "/",
  handler: app
};
