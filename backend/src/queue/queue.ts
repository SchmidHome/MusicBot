import { ConsoleLogger } from "../lib/logger";
import { db, validateCollection } from "../mongodb";
import { QueueElement, QueueElementSchema } from "./types";

export const queueLogger = new ConsoleLogger("Queue");

export const queueCollection = db.collection<QueueElement>("queueElements");
validateCollection(queueCollection, QueueElementSchema);
