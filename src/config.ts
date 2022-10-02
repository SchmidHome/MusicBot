// loading environment variables out of .env fil
import dotenv from "dotenv"
import { ConsoleLogger } from "./logger"
dotenv.config()

const logger = new ConsoleLogger("config")

let err = false
function CONFIG(name: string) {
    if (!process.env[name]) {
        logger.error("Specify " + name + " in .env file!")
        
        err = true
    }
    return process.env[name] || ""
}

logger.info("loading environment variables")
export const TELEGRAM_TOKEN = CONFIG("TELEGRAM_TOKEN")
export const SPOTIFY_CLIENT_ID = CONFIG("SPOTIFY_CLIENT_ID")
export const SPOTIFY_CLIENT_SECRET = CONFIG("SPOTIFY_CLIENT_SECRET")
export const USER_FILE = CONFIG("USER_FILE")
export const PLAYLIST_FILE = CONFIG("PLAYLIST_FILE")
export const SONOS_DEVICE_NAME = CONFIG("SONOS_DEVICE_NAME")

if (err) process.exit(1)
