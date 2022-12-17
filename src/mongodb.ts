
import { MongoClient } from "mongodb"
import { ConsoleLogger } from "./logger";

const logger = new ConsoleLogger("mongodb")

export const client = new MongoClient("mongodb://root:pass@localhost:27017/")

export const db = client.db("musicbot")
const collection = db.collection('test');


async function main() {
    logger.log("Connecting to server...")
    await client.connect();
    logger.log('Connected successfully to server');
}

main()
