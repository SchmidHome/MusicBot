import { Cached, db, validateCollection } from "../mongodb";
import { getColorFromSong } from "./color";
import { awaitRequest, canRequest } from "./rateLimiter";
import { Song, SongSchema, SongUri } from "./song";
import { loggerSpotify, spotify } from "./spotify";

const songCache = db.collection<Cached<Song>>("songCache");
validateCollection(songCache, SongSchema);

export async function getSong(uri: SongUri): Promise<Song> {
  const cachedSong = await songCache.findOne({ songUri: uri });

  if (cachedSong && cachedSong.validUntil > Date.now()) {
    return SongSchema.parse(cachedSong);
  } else {
    await awaitRequest();
    const id = uri.slice(-22);
    loggerSpotify.log("get songs", id);
    const track = await spotify.getTrack(id);

    const song = await trackToSong(track.body);
    return SongSchema.parse(song);
  }
}

export async function trackToSong(
  track: SpotifyApi.TrackObjectFull
): Promise<Song> {
  const color = await getColorFromSong(track.album.images[0].url);
  if (!color) loggerSpotify.warn(`no color found for ${track.name}`);
  const song = {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    imageUri: track.album.images[0].url,
    songUri: track.uri,
    duration_ms: track.duration_ms,
    color: color || [255, 255, 255],
  };

  await songCache.updateOne(
    { songUri: track.uri },
    { $set: { ...song, validUntil: Date.now() + 1000 * 60 * 60 * 24 * 7 } },
    { upsert: true }
  );
  return song;
}
