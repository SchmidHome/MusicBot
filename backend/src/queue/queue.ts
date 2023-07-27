import { ConsoleLogger } from "../lib/logger";
import { db } from "../mongodb";
import { QueueElement } from "./types";

export const queueLogger = new ConsoleLogger("Queue");

export const queueCollection = db.collection<QueueElement>("queueElements");
