import { Router } from "express";

export const delayRouter = Router();

let globalDelay = 0;

delayRouter.get("/delay", (req, res) => {
  res.status(200).json({ delay: globalDelay });
});

delayRouter.post("/delay", (req, res) => {
  const { delay } = req.body;
  if (typeof delay !== "number") {
    return res.status(400).json({ error: "delay must be a number" });
  }
  globalDelay = delay;
  res.status(200).json({ delay: globalDelay });
});