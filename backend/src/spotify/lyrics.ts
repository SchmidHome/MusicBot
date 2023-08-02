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
