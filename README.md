
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
| /volume    | POST   | "+" "-" or 0-100                           | 0-100                          | set volume               | OK     |
| /lyrics    | GET    |                                            | string                         | get lyrics               | -      |
| /playing   | GET    |                                            | ApiPlayingElement or undefined | get playing              | OK     |
| /queue     | GET    |                                            | ApiQueueElement[]              | get queue                | OK     |
| /user      | GET    |                                            | 201:User or 200:{ ip: string } | get user or IP of device | WIP    |
| /queue     | POST   | ApiSongElement                             |                                | add to queue             | WIP    |
| /queue     | DELETE | ApiQueueElement                            |                                | remove                   | -      |
| /search    | POST   | string                                     | ApiSongElement[]               | search                   | -      |
| /queueMove | POST   | {song: ApiQueueElement, direction: number} |                                | move in queue            | -      |
