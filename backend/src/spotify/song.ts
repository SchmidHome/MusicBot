import z from 'zod'

export const SongSchema = z.object({
    name: z.string(),
    artist: z.string(),
    album: z.string(),
    imageUri: z.string().url(),
    spotifyUri: z.string().url(),
    duration_ms: z.number(),
})

export type Song = z.infer<typeof SongSchema>
