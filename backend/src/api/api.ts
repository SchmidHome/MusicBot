import z from "zod";
import Express from "express";
import cors from "cors";
import morgan from "morgan";
import { ConsoleLogger } from "../lib/logger";
import volumeRouter from "./volume";
import { queueRouter } from "./queue";
import { checkUser, getIp } from "../user";
import { searchRouter } from "./search";
import { lyricsRouter } from "./lyrics";
import chalk from "chalk";

export const loggerAPI = new ConsoleLogger("api", chalk.red);

const app = Express();
app.use(cors({ origin: "*" }));
app.use(Express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message) => loggerAPI.log(message.trim()),
    },
  })
);

app.get("/", async (_, res) => res.send("MusicBot V2"));
app.get("/user", async (req, res) => {
  const ip = getIp(req);
  if (!ip) return res.status(400).send("No IP found.");
  const user = await checkUser(req);
  if (user) return res.status(200).json(user);
  else res.status(201).json({ ip, state: "guest" });
});

app.use(volumeRouter);
app.use(queueRouter);
app.use(searchRouter);
app.use(lyricsRouter);

export function startAPI() {
  app.listen(3000, () => loggerAPI.log("Started and listening on port 3000."));
}
