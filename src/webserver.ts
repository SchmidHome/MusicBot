import Express from 'express';
import cors from 'cors';
import { getLyrics, getSong } from './spotify';
import morgan from 'morgan';
import { ConsoleLogger } from './logger';
import { getVolume } from './sonos/sonosVolumeControl';
import { QueueElement } from './classes/queueElement';

const logger = new ConsoleLogger("webserver")


export default function startExpress() {
    const app = Express()
    app.use(cors({ origin: "*" }))

    app.use(morgan('dev', {
        stream: {
            write: (message) => logger.log(message.trim())
        }
    }))

    app.get('/', async (req, res) => res.send("MusicBot V1"))

    app.get("/volume", async (_, res) => {
        const volume = await getVolume()
        res.status(200).send(volume.toString());
    })

    app.get("/queue", async (_, res) => {
        const queueElements = await QueueElement.getNextAndQueue();
        const queue: ApiQueueElement[] = await Promise.all(
            queueElements.map(async (e): Promise<ApiQueueElement> => {
                const song = await e.getSong();
                return {
                    name: song.name,
                    artist: song.artist,
                    coverURL: song.imageUri,
                    songDurationMs: song.duration_ms,
                    voteSummary: typeof e.position === "number" ? e.voteSummary : null,
                    startDate: e.playStartTime,
                    dj: (await e.getDj())?.name || "",
                }
            }));
        res.json(queue);
    })

    app.get("/playing", async (_, res) => {
        const playing = await QueueElement.getPlaying()
        if (!playing) return res.status(404).send()

        const song = await playing.getSong()

        const currentTrack: ApiPlayingElement = {
            name: song.name,
            artist: song.artist,
            coverURL: song.imageUri,
            songDurationMs: song.duration_ms,
            startDate: playing.playStartTime,
            dj: (await playing.getDj())?.name || "",
        }
        res.json(currentTrack);
    })

    app.get("/lyrics", async (_, res) => {
        const playing = await QueueElement.getPlaying()
        if (!playing) return res.status(404).send()

        const lyrics = await getLyrics(playing.spotifyUri);
        res.json(lyrics);
    })

    app.listen(3000, () => logger.log("Started and listening on port 3000."))
}

interface ApiQueueElement {
    name: string,
    voteSummary: number | null,
    artist: string,
    coverURL: string,
    songDurationMs: number,
    startDate?: Date,
    dj: string,
}

interface ApiPlayingElement {
    name: string,
    artist: string,
    coverURL: string,
    songDurationMs: number,
    startDate?: Date,
    dj: string,
}
