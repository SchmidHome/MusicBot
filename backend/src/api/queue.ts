import z from "zod";
import { Router } from "express";
import { loggerAPI } from "./api";
import { getFullQueue, getPlaying } from "../queue/getter";
import { getSong } from "../spotify/songCache";
import { addSong } from "../queue/setter";
import { checkUser } from "../user";

export const queueRouter = Router();

queueRouter.get("/playing", async (req, res) => {
  const playing = await getPlaying();
  if (!playing) return res.json(undefined);

  const song = await getSong(playing.songUri);
  res.status(200).json({ ...playing, ...song });
});

queueRouter.get("/queue", async (req, res) => {
  const queue = await getFullQueue();
  queue.shift();
  const songQueue = await Promise.all(
    queue.map(async (song) => getSong(song.songUri))
  );
  loggerAPI.debug(JSON.stringify(songQueue));
  res.status(200).json(songQueue);
});

queueRouter.post("/queue", async (req, res) => {
  const user = await checkUser(req);
  if (!user) return res.status(401).send("Unauthorized");

  const songUri = z.string().parse(req.body.songUri);
  const song = await getSong(songUri);
  if (!song) return res.status(404).send("Song not found.");
  addSong(song.songUri, user.name);
  res.status(200).send("Added song to queue.");
});

