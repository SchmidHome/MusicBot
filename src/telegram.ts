import TelegramBot, { Message } from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN } from "./config"
import { assertIsMatch, assertIsNotUndefined, assertIsRegistered, isRegistered } from './helper'
import { addToQueue } from './sonos'
import { querySong } from './spotify'
import { UserState } from './types'
import { getUser, setUser } from './userDatabase'

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

bot.on("error", (err) => {
    console.error("Error: ", err)
})
