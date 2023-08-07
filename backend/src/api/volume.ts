import z from "zod";
import { Router } from "express";
import usedPlayer from "../player/usedPlayer";
import { loggerAPI } from "./api";

const volumeRouter = Router();

export const volumePostRequestSchema = z.object({
  volume: z
    .string()
    .regex(/^\d+$/)
    .transform((i) => parseInt(i))
    .refine((i) => i >= 0 && i <= 100)
    .or(z.enum(["up", "down"])),
});
export type VolumePostRequest = z.infer<typeof volumePostRequestSchema>;

volumeRouter.get("/volume", async (req, res) =>
  res.status(200).send(String(await usedPlayer.getVolume()))
);
volumeRouter.post("/volume", async (req, res) => {
  try {
    loggerAPI.log(JSON.stringify(req.query));
    const { volume } = volumePostRequestSchema.parse(req.query);
    if (typeof volume === "number") {
      await usedPlayer.setVolume(volume);
    } else {
      let vol = await usedPlayer.getVolume();
      if (volume === "up") vol += 5;
      else vol -= 5;
      await usedPlayer.setVolume(vol);
    }
    res.status(200).send(String(await usedPlayer.getVolume()));
  } catch (error) {
    return res.status(400).json(error);
  }
});

export default volumeRouter;
