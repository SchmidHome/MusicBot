import z from "zod";
import { Router } from "express";
import { loggerAPI } from "./api";
import { getFullQueue, getId, getPlaying } from "../queue/getter";
import { getSong } from "../spotify/songCache";
import { addSong, setPosition, setType } from "../queue/setter";
import { checkUser } from "../user";
import { resortQueue } from "../queue/sort";
import usedPlayer from "../player/usedPlayer";
import { playedRecently } from "../queue/playedRecently";

export const queueRouter = Router();

queueRouter.get("/playing", async (req, res) => {
  const playing = await getPlaying();
  const paused = await usedPlayer.getPaused();
  if (!playing) return res.json(undefined);

  const song = await getSong(playing.songUri);
  res.status(200).json({ ...playing, ...song, paused });
});

queueRouter.get("/queue", async (req, res) => {
  const queue = await getFullQueue();
  const songQueue = await Promise.all(
    queue
      .filter((song) => song.type != "now")
      .map(async (song) => ({ ...song, ...(await getSong(song.songUri)) }))
  );
  res.status(200).json(songQueue);
});

const queuePostSchema = z.object({
  songUri: z.string(),
});

queueRouter.post("/queue", async (req, res) => {
  const user = await checkUser(req);
  if (!user) return res.status(401).send("Unauthorized");

  loggerAPI.debug(JSON.stringify(req.body));
  const data = req.body;

  const parsed = queuePostSchema.safeParse(data);
  if (!parsed.success) return res.status(400).send("Invalid songUri.");
  const { songUri } = parsed.data;

  const song = await getSong(songUri);
  if (!song) return res.status(404).send("Song not found.");

  if (await playedRecently(song)) {
    return res.status(400).send("Song played recently.");
  }

  addSong(song.songUri, user.name);
  res.status(200).send("Added song to queue.");
});

const queueDeleteSchema = z.object({
  _id: z.string(),
});

queueRouter.delete("/queue", async (req, res) => {
  const user = await checkUser(req);
  if (!user) return res.status(401).send("Unauthorized");

  const data = req.body;

  const parsed = queueDeleteSchema.safeParse(data);
  if (!parsed.success) return res.status(400).send("Invalid _id or direction.");
  const { _id } = parsed.data;
  const element = await getId(_id);
  if (!element) return res.status(404).send("ID not found.");
  if (!["queued", "new"].includes(element.type))
    return res.status(400).send("Can't delete this element.");

  await setType(element._id, "removed");
  res.status(200).send("Removed song from queue.");
});

const queueMoveSchema = z.object({
  _id: z.string(),
  direction: z.number().int(),
});

queueRouter.post("/queueMove", async (req, res) => {
  const user = await checkUser(req);
  if (!user) return res.status(401).send("Unauthorized");

  const data = req.body;

  const parsed = queueMoveSchema.safeParse(data);
  if (!parsed.success) return res.status(400).send("Invalid _id or direction.");
  const { _id, direction } = parsed.data;
  const element = await getId(_id);
  if (!element) return res.status(404).send("ID not found.");
  if (element.type != "queued")
    return res.status(400).send("Can't move this element.");

  await resortQueue(element._id, direction);
  res.status(200).send("Moved song in queue.");
});
