import z from "zod";
import { SongUriSchema } from "./song";

export const BackgroundPlaylistSchema = z.object({
  uri: z.string().url(),
  songs: z.array(SongUriSchema),
});

export type BackgroundPlaylist = z.infer<typeof BackgroundPlaylistSchema>;