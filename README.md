
# MusicBot

install development tools:

npm install --global yarn typescript nodemon pm2

## API to Frontend

```typescript
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

type ApiSongElement = {
    name: string,
    artist: string,
    coverURL: string,
    songDurationMs: number,
}

```

| API        | Type   | Request                                    | Response          | Description   |
| ---------- | ------ | ------------------------------------------ | ----------------- | ------------- |
| /          | GET    |                                            | MusicBot Vx       | version       |
| /volume    | GET    |                                            | 0-100             | get volume    |
| /queue     | GET    |                                            | ApiQueueElement[] | get queue     |
| /playing   | GET    |                                            | ApiPlayingElement | get playing   |
| /lyrics    | GET    |                                            | string            | get lyrics    |
| /volume    | POST   | "+" "-" or 0-100                           | 0-100             | set volume    |
| /search    | POST   | string                                     | ApiSongElement[]  | search        |
| /queue     | DELETE | ApiQueueElement                            |                   | remove        |
| /queueMove | POST   | {song: ApiQueueElement, direction: number} |                   | move in queue |
| /queue     | POST   | ApiSongElement                             |                   | add to queue  |
