import z from "zod";
import Express from "express";
import cors from "cors";
import morgan from "morgan";
import { ConsoleLogger } from "../lib/logger";
import volumeRouter from "./volume";
import { queueRouter } from "./queue";

export const loggerAPI = new ConsoleLogger("api");

const app = Express();
app.use(cors({ origin: "*" }));

app.use(
  morgan("dev", {
    stream: {
      write: (message) => loggerAPI.log(message.trim()),
    },
  })
);

app.get("/", async (_, res) => res.send("MusicBot V2"));

app.use(volumeRouter);
app.use(queueRouter);

export function startAPI() {
  app.listen(3000, () => loggerAPI.log("Started and listening on port 3000."));
}
