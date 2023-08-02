import fetch from "node-fetch";
import { Cached, db, validateCollection } from "../mongodb";
import { Lyrics } from "./lyrics";

const lyricsCache = db.collection<Cached<Lyrics>>("lyricsCache");
// validateCollection(lyricsCache, LyricsSchema);
export function clearLyricsCache() {
  return lyricsCache.deleteMany({});
}

export async function getLyrics(uri: string): Promise<Lyrics> {
  const cachedLyrics = await lyricsCache.findOne({ spotifyUri: uri });

  if (cachedLyrics && cachedLyrics.validUntil > Date.now()) {
    return cachedLyrics;
  } else {
    try {
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
    } catch (error) {
      return {
        error: true,
        lines: [],
        syncType: "NO_SONG",
      };
    }
  }
}
