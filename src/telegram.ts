import TelegramBot, { Message } from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN } from "./config"

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

bot.on("error", (err) => {
    console.error("Error: ", err)
})
