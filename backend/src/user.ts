import z from 'zod'

export const UserStateSchema = z.enum([
    "dj", // can only add songs
    "admin", // can add, remove and reorder songs
])

export type UserState = z.infer<typeof UserStateSchema>

export const UserSchema = z.object({
    IP: z.string().ip(),
    name: z.string(),
    state: UserStateSchema,
})

export type User = z.infer<typeof UserSchema>

