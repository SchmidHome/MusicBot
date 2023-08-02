import { Router } from "express";
import { getPlaying } from "../queue/getter";
import { getSong } from "../spotify/songCache";
import { getLyrics } from "../spotify/lyricsCache";
import usedPlayer from "../player/usedPlayer";
import { loggerAPI } from "./api";

export const lyricsRouter = Router();

lyricsRouter.get("/lyrics", async (req, res) => {
  const playing = await getPlaying();
  if (!playing) return res.json(undefined);
  const paused = await usedPlayer.getPaused();

  const song = await getSong(playing.songUri);

  const lyrics = await getLyrics(song.songUri);
  if (!lyrics) loggerAPI.error(`NO LYRICS FOR ${song.songUri}`);

  res.status(200).json({ ...playing, ...song, paused, lyrics });
});
