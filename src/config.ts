// loading environment variables out of .env fil
import dotenv from "dotenv"
dotenv.config()

let err = false
function CONFIG(name: string, error_msg: string) {
    if (!process.env[name]) {
        console.error("Error: " + error_msg)
        err = true
    }
    return process.env[name] || ""
}

export const TELEGRAM_TOKEN = CONFIG("TELEGRAM_TOKEN", "Specify TELEGRAM_TOKEN in environment")
export const SPOTIFY_CLIENT_ID = CONFIG("SPOTIFY_CLIENT_ID", "Specify SPOTIFY_CLIENT_ID in environment")
export const SPOTIFY_CLIENT_SECRET = CONFIG("SPOTIFY_CLIENT_SECRET", "Specify SPOTIFY_CLIENT_SECRET in environment")

if (err) process.exit(1)
