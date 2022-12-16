import Express from 'express';
import cors from 'cors';
import { getCurrentTrack, getQueue, getScheduledTime, getTrackInfo, getVolume, timeStringToSeconds } from './sonos';
import { uriToSong } from './spotify';
import morgan from 'morgan';
import { ConsoleLogger } from './logger';

const logger = new ConsoleLogger("webserver")

export default function startExpress() {
    const app = Express()
    app.use(cors());
    app.use(morgan('dev', {stream: {
        write: (message) => logger.log(message.trim())
    }}))

    app.get('/', async (req, res) => res.send("MusicBot V1"))

    app.get("/volume", async (_, res) => {
        const volume = await getVolume()
        res.status(200).send(volume.toString());
    })

    app.get("/queue", async (_, res) => {
        const queueURIs = await getQueue();
        const queue: QueueElement[] = await Promise.all(
            queueURIs.map(async (uri): Promise<QueueElement> => {
                const song = await uriToSong(uri);
                return {
                    name: song.name,
                    artist: song.artist,
                    coverURL: song.imageUri,
                    playingTime: await getScheduledTime(uri),
                    dj: "TODO" //TODO
                }
            }));
        res.json(queue);
    })

    app.get("/playing", async (_, res) => {
        const currentTrackURI = await getCurrentTrack();
        if (!currentTrackURI) return res.status(404).send();
        const song = await uriToSong(currentTrackURI);
        const currentTrack: QueueElement = {
            name: song.name,
            artist: song.artist,
            coverURL: song.imageUri,
            dj: "TODO", //TODO
            playingTime: await getScheduledTime(currentTrackURI)
        }
        const positionInTrack = timeStringToSeconds((await getTrackInfo()).RelTime)
        res.json({
            currentTrack,
            positionInTrack
        });
    })

    app.listen(3000, () => logger.log("Started and listening on port 3000."))
}

interface QueueElement {
    name: string;
    artist: string;
    coverURL: string;
    playingTime: Date;
    dj: string;
}
