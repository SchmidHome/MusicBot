type SongElement = {
  songUri: string;
  name: string;
  artist: string;
  album: string;
  imageUri: string;
  duration_ms: number;
};

type QueueElement = SongElement & {
  // Element info
  _id: ObjectId;
  type: "new" | "queued" | "next" | "now" | "played" | "removed";
  playStartTime?: Date | undefined;
  pos?: number | undefined;
  addedBy?: string | undefined;
};

type PlayingElement = QueueElement & {
  paused: boolean;
  type: "now";
  pos: 0;
};

type LyricsElement = PlayingElement & {
  lyrics: Lyrics;
};

export interface Lyric {
  startTimeMs: number;
  words: string;
  syllables: [];
  endTimeMs: 0;
}

export interface SyncedLyrics {
  error: false;
  syncType: "LINE_SYNCED";
  lines: Lyric[];
}

export interface UnsyncedLyrics {
  error: false;
  syncType: "UNSYNCED";
  lines: (Omit<Lyric, "startTimeMs"> & { startTimeMs: 0 })[];
}

export interface NoLyrics {
  error: true;
  syncType: "NO_LYRICS" | "NO_SONG";
  lines: [];
}

export type Lyrics = NoLyrics | SyncedLyrics | UnsyncedLyrics;

export type User = {
  ip: string;
  name: string;
  state: "dj" | "admin";
};
