import TelegramBot from "node-telegram-bot-api"
import { User } from "../classes/user"
import { assertIsMatch } from "../helper"
import { log, logger, sendMessage } from "./telegram"

export async function start(msg: TelegramBot.Message) {
    try {
        const user = await User.getUser(msg.chat.id)
        log(user, "/start")
        if (user.isRegistered()) {
            user.sendAlreadyRegisteredMessage()
        } else {
            user.sendWelcomeUnknownMessage()
        }
    } catch (error) {
        console.error(error)
    }
}

export async function register(msg: TelegramBot.Message, match: RegExpExecArray | null) {
    try {
        const user = await User.getUser(msg.chat.id)
        assertIsMatch(match)
        log(user, "/start", match[1])

        if (user.isRegistered()) {
            user.sendAlreadyRegisteredMessage()
        } else {
            const username = match[1]
            await user.setName(username)
            await user.sendWelcomeUserMessage()
            logger.log(`${user.toString()} registered`)
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getState(msg: TelegramBot.Message) {
    try {
        const user = await User.getUser(msg.chat.id)
        user.update()

        switch (user.state) {
            case 'unknown':
                await sendMessage(user.chatId, "Du bist nicht registriert!")
                break
            case "user":
                await sendMessage(user.chatId, "Du bist registriert!")
                break
            case "dj":
                await sendMessage(user.chatId, "Du bist ein DJ!")
                break
            case 'admin':
                await sendMessage(user.chatId, "Die Macht ist mit dir!")
                break
            default:
                await sendMessage(user.chatId, "Das hätte nicht passieren dürfen!")
                throw new Error("Unknown state: " + user.state)
        }
    } catch (error) {
        console.error(error)
    }
}
