import z from "zod";

export const SongUriSchema = z.string().url(); // ID

export const SongSchema = z.object({
  songUri: SongUriSchema,
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  color: z.tuple([
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
  ]),
  imageUri: z.string().url(),
  duration_ms: z.number(),
});

export type SongUri = z.infer<typeof SongUriSchema>;
export type Song = z.infer<typeof SongSchema>;
