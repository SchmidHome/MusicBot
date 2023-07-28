
# MusicBot

install development tools:

npm install --global yarn typescript nodemon pm2

## API to Frontend

```typescript

type ApiSongElement = {
    songUri: string;
    name: string;
    artist: string;
    album: string;
    imageUri: string;
    duration_ms: number;
}

type ApiQueueElement = ApiSongElement & {
    // Element info
    _id: ObjectId;
    type: "new" | "queued" | "next" | "now" | "played" | "removed";
    playStartTime?: Date | undefined;
    pos?: number | undefined;
    addedBy?: string | null | undefined;
}

type ApiPlayingElement = ApiQueueElement & {
    startDate: Date;
    type: "now";
    pos: 0;
}

```

| API        | Type   | Request                                    | Response                       | Description              | Status |
| ---------- | ------ | ------------------------------------------ | ------------------------------ | ------------------------ | ------ |
| /          | GET    |                                            | MusicBot Vx                    | version                  | OK     |
| /volume    | GET    |                                            | 0-100                          | get volume               | OK     |
| /volume    | POST   | { volume: "+" or "-" or 0-100 }            | 0-100                          | set volume               | TEST   |
| /lyrics    | GET    |                                            | string                         | get lyrics               | -      |
| /playing   | GET    |                                            | ApiPlayingElement or undefined | get playing              | OK     |
| /queue     | GET    |                                            | ApiQueueElement[]              | get queue                | OK     |
| /user      | GET    |                                            | 201:User or 200:{ ip: string } | get user or IP of device | OK     |
| /queue     | POST   | { songUri: songUri }                       |                                | add to queue             | TEST   |
| /queue     | DELETE | { _id: ObjectId }                          |                                | remove                   | TEST   |
| /search    | POST   | { query: string, resultCount: number = 5 } | ApiSongElement[]               | search                   | TEST   |
| /queueMove | POST   | { _id: ObjectId, direction: number }       |                                | move in queue            | TEST   |
