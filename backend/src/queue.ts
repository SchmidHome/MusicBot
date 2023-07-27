import z from "zod";
import { ObjectId } from "mongodb";

export const PositionTypeSchema = z.enum([
  "new", // initial state, not yet queued
  "queued", // has queue position 1+
  "next", // has queue position 1
  "now", // has queue position 0
  "played", // already played
  "removed", // removed from queue
]);


export const QueueElementSchema = z.object({
  _id: z.instanceof(ObjectId),
  songId: z.instanceof(ObjectId),
  position: PositionTypeSchema,
  queuePosition: z.number().min(0).optional(),
  addedBy: z.string().optional(),
});

export type PositionType = z.infer<typeof PositionTypeSchema>;
export type QueueElement = z.infer<typeof QueueElementSchema>;
