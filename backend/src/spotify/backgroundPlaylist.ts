import z from "zod";
import { loggerSpotify } from "./spotify";
import { Song } from "./song";
import { db } from "../mongodb";
import { getPlaylist } from "./playlistCache";
import { playedRecently } from "../queue/playedRecently";
import { getSong } from "./songCache";

export const BackgroundPlaylistSchema = z.object({
  name: z.string(),
  uri: z.string().url(),
  selected: z.boolean(),
});

export type BackgroundPlaylist = z.infer<typeof BackgroundPlaylistSchema>;

const backgroundPlaylists = db.collection<BackgroundPlaylist>(
  "backgroundPlaylists"
);

export async function getSongFromBackgroundPlaylist() {
  try {
    const activeBackgroundPlaylists = await backgroundPlaylists
      .find({ selected: true })
      .toArray();

    if (!activeBackgroundPlaylists.length) {
      loggerSpotify.warn(`No default playlist selected.`);
      return;
    }
    loggerSpotify.log(
      `Getting track from ${activeBackgroundPlaylists
        .map((e) => e.name)
        .join(", ")}`
    );

    const activePlaylists = await Promise.all(
      activeBackgroundPlaylists.map(async (playlist) =>
        getPlaylist(playlist.uri)
      )
    );

    const song = await getNewTrack(
      await Promise.all(
        activePlaylists
          .map((p) => p.songs)
          .flat()
          .map((s) => getSong(s))
      )
    );

    if (song == undefined) {
      loggerSpotify.warn(`No new track found`);
      //TODO activate other playlists
      return;
    }
    return song;
  } catch (error) {
    loggerSpotify.error(error);
  }
}

function between(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

// return the next track number if song has not played recently. Make sure Playlist has more than 10 Songs!
async function getNewTrack(playlist: Song[]): Promise<Song | undefined> {
  let i = between(0, playlist.length);
  const iStart = i;

  while (await playedRecently(playlist[i])) {
    i++;
    if (i >= playlist.length) i = 0;
    if (i == iStart) return undefined;
  }
  loggerSpotify.log(`${playlist[i].name} (${playlist[i].artist}) selected`);
  return playlist[i];
}
