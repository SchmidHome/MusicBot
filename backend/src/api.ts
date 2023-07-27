import Express from "express";
import cors from "cors";
import morgan from "morgan";
import { ConsoleLogger } from "./lib/logger";

const logger = new ConsoleLogger("api")

export default function startExpress() {
    const app = Express()
    app.use(cors({ origin: "*" }))

    app.use(morgan("dev", {
        stream: {
            write: (message) => logger.log(message.trim())
        }
    }))

    app.get("/", async (req, res) => res.send("MusicBot V2"))

    // app.get("/volume", async (req, res) => res.send(await )

    app.listen(3000, () => logger.log("Started and listening on port 3000."))
}




type ApiQueueElement = {
    name: string,
    voteSummary: number | null,
    artist: string,
    coverURL: string,
    songDurationMs: number,
    startDate?: Date,
    dj: string,
}

type ApiPlayingElement = {
    name: string,
    artist: string,
    coverURL: string,
    songDurationMs: number,
    startDate?: Date,
    dj: string,
} | "nothing playing"
