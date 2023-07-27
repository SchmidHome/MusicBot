import { Router } from "express";
import usedPlayer from "../player/usedPlayer";

const volumeRouter = Router();

volumeRouter.get("/volume", async (req, res) =>
  res.send(await usedPlayer.getVolume())
);
volumeRouter.post("/volume", async (req, res) => {
  await usedPlayer.setVolume(parseInt(req.query.volume as string));
  res.send(await usedPlayer.getVolume());
});

export default volumeRouter;
