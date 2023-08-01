import chalk from "chalk";
import { ConsoleLogger } from "../lib/logger";
// import { RWLockWritePreferring } from "../lib/rwlock-write";
import { db, validateCollection } from "../mongodb";
import { QueueElement, QueueElementSchema } from "./types";

export const queueLogger = new ConsoleLogger("queue", chalk.black);

// export const queueLock = new RWLockWritePreferring();

export const queueCollection = db.collection<QueueElement>("queueElements");
validateCollection(queueCollection, QueueElementSchema);
