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
    app.use(cors());
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
                    startDate: e.playStartTime || new Date(), //TODO
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
            endDate: new Date((playing.playStartTime || new Date()).getMilliseconds() + song.duration_ms), //TODO
            dj: (await playing.getDj())?.name || "",
        }
        const positionInTrack = new Date(Date.now() - (playing.playStartTime || new Date()).getMilliseconds())
        res.json({
            currentTrack,
            positionInTrack
        });
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
    artist: string,
    coverURL: string,
    songDurationMs: number,
    startDate: Date,
    dj: string,
}

interface ApiPlayingElement {
    name: string,
    artist: string,
    coverURL: string,
    songDurationMs: number,
    endDate: Date,
    dj: string,
}
