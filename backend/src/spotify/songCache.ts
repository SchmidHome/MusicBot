import { Cached, db } from "../mongodb";
import { Song, SongUri } from "./song";
import { loggerSpotify, spotify } from "./spotify";

const songCache = db.collection<Cached<Song>>("songCache");

let allowedRequests = 0;
setInterval(() => {
  allowedRequests = 10;
}, 2000);

export async function getSong(uri: SongUri): Promise<Song> {
  const cachedSong = await songCache.findOne({ spotifyUri: uri });

  if (cachedSong && cachedSong.validUntil > Date.now()) {
    return cachedSong;
  } else {
    while (allowedRequests <= 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    allowedRequests--;
    const id = uri.slice(-22);
    loggerSpotify.log("get songs", id);
    const track = await spotify.getTrack(id);

    const song = await trackToSong(track.body);
    return song;
  }
}

export async function trackToSong(track: SpotifyApi.TrackObjectFull): Promise<Song> {
  const song = {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    imageUri: track.album.images[0].url,
    spotifyUri: track.uri,
    duration_ms: track.duration_ms,
  };
  await songCache.updateOne(
    { spotifyUri: track.uri },
    { $set: { ...song, validUntil: Date.now() + 1000 * 60 * 60 * 24 * 7 } },
    { upsert: true }
  );
  return song;
}
