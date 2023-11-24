import z from "zod";
import { Collection, Document, MongoClient } from "mongodb";
import { ConsoleLogger } from "./lib/logger";
import chalk from "chalk";

const logger = new ConsoleLogger("mongodb", chalk.magentaBright);

export type Cached<T> = T & { validUntil: number };

export const client = new MongoClient("mongodb://root:pass@localhost:27017/");

export const db = client.db("musicbot");

export const collection = db.collection.bind(db);

async function main() {
  logger.log("Connecting to server...");
  await client.connect();
  logger.log("Connected successfully to server");
}

main();

export async function validateCollection<T extends Document>(
  collection: Collection<T>,
  schema: z.ZodTypeAny
) {
  const allData = await collection.find().toArray();
  let errors = 0;
  allData.forEach((data) => {
    try {
      schema.parse(data);
    } catch (e) {
      logger.error(
        `Invalid data in collection ${collection.collectionName} id ${
          data._id
        }: ${JSON.stringify(e)}`
      );
      errors++;
    }
  });
  logger.log(
    `Found ${errors}/${allData.length} errors in collection ${collection.collectionName}`
  );
}
