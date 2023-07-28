import { db } from "../mongodb";
import { awaitRequest } from "./rateLimiter";
import { Song } from "./song";
import { trackToSong } from "./songCache";
import { loggerSpotify, spotify } from "./spotify";

const searchCache = db.collection<{
  str: string;
  results: Song[];
  end: boolean;
  validUntil: number;
}>("searchCache");

export async function querySong(
  searchText: string,
  searchLength: number = 5
): Promise<Song[]> {
  const result = await searchCache.findOne({ str: searchText });
  if (
    result &&
    result.validUntil > Date.now() &&
    result.results.length >= searchLength
  ) {
    return result.results;
  } else if (result && result.validUntil > Date.now() && result.end) {
    return [];
  } else {
    if (result) await searchCache.deleteMany({ str: searchText });

    const lengthStart = result?.results.length || 0;
    const songsAdded = await queryRequest(
      searchText,
      lengthStart,
      searchLength - lengthStart
    );
    const songs = [...(result?.results || []), ...songsAdded];
    await searchCache.insertOne({
      str: searchText,
      results: songs,
      end: songsAdded.length == 0,
      validUntil: Date.now() + 1000 * 60 * 60 * 24,
    });
    return songs;
  }
}

async function queryRequest(
  song: string,
  offset: number,
  limit: number
): Promise<Song[]> {
  const tracks =
    (await spotify.searchTracks(song, { limit, offset })).body.tracks?.items ||
    [];
  await awaitRequest();
  loggerSpotify.log("query songs", song, offset, limit);
  return Promise.all(tracks.map(trackToSong));
}
