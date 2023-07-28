import z from "zod";
import { Router } from "express";
import { loggerAPI } from "./api";
import { getFullQueue, getPlaying } from "../queue/getter";
import { getSong } from "../spotify/songCache";

export const queueRouter = Router();

queueRouter.get("/playing", async (req, res) => {
  const playing = await getPlaying();
  if (!playing) return res.json(undefined);

  const song = await getSong(playing.songUri);
  res.json({ ...playing, ...song });
});

queueRouter.get("/queue", async (req, res) => {
  const queue = await getFullQueue();
  queue.shift();
  const songQueue = await Promise.all(
    queue.map(async (song) => getSong(song.songUri))
  );
  loggerAPI.debug(JSON.stringify(songQueue));
  res.json(songQueue);
});
