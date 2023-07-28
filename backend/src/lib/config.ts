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
export const SPOTIFY_PLAYER_CODE = CONFIG("SPOTIFY_PLAYER_CODE")
export const SONOS_DEVICE_NAME = CONFIG("SONOS_DEVICE_NAME")
export const SONOS_DEVICE_IP = CONFIG("SONOS_DEVICE_IP")
export const PLAYING_OFFSET_MS = CONFIG("PLAYING_OFFSET_MS")

export const BLACKLIST = (process.env.BLACKLIST || "").split(",").map(e => e.trim()).filter(e => e.length > 0)

if (err) process.exit(1)
