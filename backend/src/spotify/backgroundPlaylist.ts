import z from "zod";

export const BackgroundPlaylistSchema = z.object({
  name: z.string(),
  uri: z.string().url(),
  selected: z.boolean(),
});

export type BackgroundPlaylist = z.infer<typeof BackgroundPlaylistSchema>;
