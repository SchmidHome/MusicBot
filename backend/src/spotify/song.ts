import z from "zod";

export const SongUriSchema = z.string().url(); // ID

export const SongSchema = z.object({
  spotifyUri: SongUriSchema,
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  imageUri: z.string().url(),
  duration_ms: z.number(),
});

export type SongUri = z.infer<typeof SongUriSchema>;
export type Song = z.infer<typeof SongSchema>;
