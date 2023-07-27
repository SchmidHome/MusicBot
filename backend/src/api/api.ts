import Express from "express";
import cors from "cors";
import morgan from "morgan";
import { ConsoleLogger } from "../lib/logger";
import volumeRouter from "./volume";

const logger = new ConsoleLogger("api");

const app = Express();
app.use(cors({ origin: "*" }));

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.log(message.trim()),
    },
  })
);

app.get("/", async (_, res) => res.send("MusicBot V2"));

app.use(volumeRouter);

export function startAPI() {
  app.listen(3000, () => logger.log("Started and listening on port 3000."));
}
