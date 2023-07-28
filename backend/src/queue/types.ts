import z from "zod";
import { ObjectId } from "mongodb";
import { SongUriSchema } from "../spotify/song";

export const PositionTypeSchema = z.enum([
  "new", // initial state, not yet queued
  "queued", // has queue position 1+
  "next", // has queue position 1
  "now", // has queue position 0
  "played", // already played
  "removed", // removed from queue
]);

export const QueueElementSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  songUri: SongUriSchema,
  type: PositionTypeSchema,
  playStartTime: z.date().optional(),
  pos: z.number().min(0).optional(),
  addedBy: z.string().or(z.null()).optional(),
});

export type PositionType = z.infer<typeof PositionTypeSchema>;
export type QueueElement = z.infer<typeof QueueElementSchema>;
