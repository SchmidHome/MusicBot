
import { MongoClient } from "mongodb"
import { ConsoleLogger } from "./lib/logger";

const logger = new ConsoleLogger("mongodb")

export type Cached<T> = T & { validUntil: number }

export const client = new MongoClient("mongodb://root:pass@localhost:27017/")

export const db = client.db("musicbot")

export const collection = db.collection.bind(db)

async function main() {
    logger.log("Connecting to server...")
    await client.connect();
    logger.log('Connected successfully to server');
}


main()
