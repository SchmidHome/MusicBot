import TelegramBot from "node-telegram-bot-api"
import { User } from "../classes/user"
import { assertIsMatch } from "../helper"
import { editMessage, log, logger, sendMessage } from "./telegram"

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


const timer: { [messageId: number]: { chatId: number, timer: NodeJS.Timeout | undefined } } = {}

async function updateAdminMessage(user: User, messageId: number | null) {
    if (!messageId) {
        messageId = await sendMessage(user.chatId, "Die Macht ist mit dir!")
    }
    timer[messageId] ??= { chatId: user.chatId, timer: undefined }

    const users = (await Promise.all((await User.getAllRegisteredUserIds()).map(id => User.getUser(id)))).filter(u => u.state === "user" || u.state === "dj")
    const buttons: TelegramBot.InlineKeyboardButton[][] = users.map(user => {
        const text = user.name || user.chatId.toString()
        return [{
            text: text,
            callback_data: `user:${user.chatId}`
        }]
    })

    for (const [_id, t] of Object.entries(timer)) {
        const id = Number(_id)
        clearTimeout(t.timer)
        await editMessage(t.chatId, messageId, "Die Macht ist mit dir!", buttons)

        // set timeout to delete buttons
        timer[id] = {
            chatId: t.chatId,
            timer: setTimeout(async () => {
                await editMessage(user.chatId, id, "Die Macht ist mit dir!", [])
                delete timer[id]
            }, 1000 * 10)
        }
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
                const msgId = await sendMessage(user.chatId, "Die Macht ist mit dir!")
                await updateAdminMessage(user, msgId)
                break
            default:
                await sendMessage(user.chatId, "Das hätte nicht passieren dürfen!")
                throw new Error("Unknown state: " + user.state)
        }
    } catch (error) {
        console.error(error)
    }
}

export async function onStateChangeCallback(user: User, messageId: number, data: string) {
    const [_, chatId] = data.split(":")
    const targetUser = await User.getUser(Number(chatId))
    const targetState = targetUser.state === "user" ? "dj" : "user"
    await targetUser.setState(targetState)
    await updateAdminMessage(user, messageId)
}
