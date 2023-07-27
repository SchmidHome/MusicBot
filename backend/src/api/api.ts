import Express from "express";
import cors from "cors";
import morgan from "morgan";
import { ConsoleLogger } from "../lib/logger";

const logger = new ConsoleLogger("api");

export const app = Express();
app.use(cors({ origin: "*" }));

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.log(message.trim()),
    },
  })
);

app.get("/", async (req, res) => res.send("MusicBot V2"));

app.listen(3000, () => logger.log("Started and listening on port 3000."));
