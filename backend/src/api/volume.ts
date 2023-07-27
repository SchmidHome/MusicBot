import usedPlayer from "../player/usedPlayer";
import { app } from "./api";

app.get("/volume", async (req, res) => res.send(await usedPlayer.getVolume()));
app.post("/volume", async (req, res) => {
  await usedPlayer.setVolume(parseInt(req.query.volume as string));
  res.send(await usedPlayer.getVolume());
});
