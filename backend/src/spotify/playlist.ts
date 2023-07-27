import z from "zod";
import { SongUriSchema } from "./song";

export const PlaylistUriSchema = z
  .string()
  .regex(/^spotify:playlist:[a-zA-Z0-9]{22}$/);

export const PlaylistSchema = z.object({
  uri: PlaylistUriSchema,
  songs: z.array(SongUriSchema),
});

export type PlaylistUri = z.infer<typeof PlaylistUriSchema>;
export type Playlist = z.infer<typeof PlaylistSchema>;
