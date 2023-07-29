import fetch from "node-fetch";
import { Cached, db } from "../mongodb";

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

const lyricsCache = db.collection<Cached<Lyrics>>('lyricsCache')

export async function getLyrics(uri: string): Promise<Lyrics> {
  const cachedLyrics = await lyricsCache.findOne({ spotifyUri: uri });

  if (cachedLyrics && cachedLyrics.validUntil > Date.now()) {
    return cachedLyrics;
  } else {
    const id = uri.slice(-22);
    const lyrics_url = "http://127.0.0.1:8000/index.php?trackid=" + id;
    const res = await fetch(lyrics_url);
    const json = await res.json();
    await lyricsCache.updateOne(
      { spotifyUri: uri },
      { $set: { ...json, validUntil: Date.now() + 1000 * 60 * 60 * 24 * 7 } },
      { upsert: true }
    );
    return json.lyrics;
  }
}
