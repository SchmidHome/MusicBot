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
                sendMessage(user.chatId, "You are not registered!")
                break
            case "user":
                sendMessage(user.chatId, "You are a user!")
                break
            case "dj":
                sendMessage(user.chatId, "You are a dj!")
                break
            case 'admin':
                sendMessage(user.chatId, "You are an admin!")
                break
            default:
                sendMessage(user.chatId, "This should not have happened!")
                throw new Error("Unknown state: " + user.state)
        }
    } catch (error) {
        console.error(error)
    }
}
