import { Cached, db, validateCollection } from "../mongodb";
import { Playlist, PlaylistSchema, PlaylistUri } from "./playlist";
import { Song } from "./song";
import { trackToSong } from "./songCache";
import { loggerSpotify, spotify } from "./spotify";

const playlistCache = db.collection<Cached<Playlist>>("playlistCache");
validateCollection(playlistCache, PlaylistSchema);

export async function getPlaylist(uri: PlaylistUri) {
  const id = uri.slice(34, 56);
  const playlist = await playlistCache.findOne({ id });
  if (playlist && playlist.validUntil > Date.now()) {
    loggerSpotify.log(`cached playlist ${uri}`);
    return playlist;
  } else {
    loggerSpotify.log(`loading playlist ${uri}`);
    const songs: Song[] = [];
    let offset = 0;
    let result;
    do {
      result = (await spotify.getPlaylistTracks(id, { offset })).body;
      songs.push(
        ...(await Promise.all(
          result.items.filter((e) => e.track).map((e) => trackToSong(e.track!))
        ))
      );
      offset = result.offset + result.limit;
    } while (result.next);

    const newPlaylist = {
      uri,
      songs: songs.map((e) => e.songUri),
      validUntil: Date.now() + 1000 * 60,
    };
    await playlistCache.updateOne(
      { id },
      { $set: newPlaylist },
      { upsert: true }
    );
    return newPlaylist;
  }
}