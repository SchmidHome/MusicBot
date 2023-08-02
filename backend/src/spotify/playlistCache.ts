import { Cached, db, validateCollection } from "../mongodb";
import { Playlist, PlaylistSchema, PlaylistUri } from "./playlist";
import { Song } from "./song";
import { trackToSong } from "./songCache";
import { loggerSpotify, spotify } from "./spotify";
import { Mutex } from "async-mutex";

const playlistCache = db.collection<Cached<Playlist>>("playlistCache");
const playlistCacheMutex = new Mutex();
validateCollection(playlistCache, PlaylistSchema);

export async function getPlaylist(uri: PlaylistUri) {
  return playlistCacheMutex.runExclusive(async () => {
    const id = uri.slice(34, 56);
    const playlist = await playlistCache.findOne({ id });
    if (playlist && playlist.validUntil > Date.now()) {
      loggerSpotify.log(`cached playlist ${uri}`);
      return playlist;
    } else {
      let timeout = setTimeout(() => {
        throw new Error("timeout");
      }, 1000 * 10);
      loggerSpotify.log(`loading playlist ${uri}`);
      const songs: Song[] = [];
      let offset = 0;
      let result;
      do {
        result = (await spotify.getPlaylistTracks(id, { offset })).body;
        songs.push(
          ...(await Promise.all(
            result.items
              .filter((e) => e.track)
              .map((e) => trackToSong(e.track!))
          ))
        );
        offset = result.offset + result.limit;
      } while (result.next);
      loggerSpotify.log(`loaded playlist ${uri}`);
      const newPlaylist = {
        uri,
        songs: songs.map((e) => e.songUri),
        validUntil: Date.now() + 1000 * 60 * 60,
      };
      await playlistCache.updateOne(
        { id },
        { $set: newPlaylist },
        { upsert: true }
      );
      // clearTimeout(timeout);
      return newPlaylist;
    }
  });
}
