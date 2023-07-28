import { Router } from "express";
import { checkUser } from "../user";
import { z } from "zod";
import { querySong } from "../spotify/songQuery";

export const searchRouter = Router();

const searchPostSchema = z.object({
    query: z.string(),
    resultCount: z.number().default(5),
});

searchRouter.search("/search", async (req, res) => {
    const user = await checkUser(req);
    if (!user) return res.status(401).send("Unauthorized");

    const data = req.body;

    const parsed = searchPostSchema.safeParse(data);
    if (!parsed.success) return res.status(400).send("Invalid query.");
    const { query, resultCount } = parsed.data;
    const songs = await querySong(query, resultCount);
    res.status(200).json(songs);
});
