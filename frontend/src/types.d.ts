export interface Song {
  name: string;
  artist: string;
  coverURL: string;
  dj: string | null;
  songDurationMs: number;
  startDate: Date | null;
  voteSummary: number | null;
}

export interface CurrentSong extends Song {
  positionInTrack: number;
}

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
  syncType: "NO_LYRICS";
  lines: [];
}

export type Lyrics = NoLyrics | SyncedLyrics | UnsyncedLyrics;

export enum Vote {
  Up = 1,
  Down = -1,
  Double = 2,
}

export interface CastedVote {
  id: string;
  vote: Vote;
  timestamp: Date;
  song: Song;
}
