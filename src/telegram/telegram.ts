import TelegramBot, { ChatId } from "node-telegram-bot-api";
import { User } from "../classes/user";
import { TELEGRAM_TOKEN } from "../config";
import { ConsoleLogger } from "../logger";
import * as userMessage from "./userMessage";
import * as playlistMessage from "./playlistMessage";
import * as volumeMessage from "./volumeMessage";
import { assertIsNotUndefined } from "../helper";
import { SongMessage } from "../classes/songMessage";
import { QueueElement } from "../classes/queueElement";
import { ObjectId } from "mongodb";

export const logger = new ConsoleLogger("telegram")

export function log(user: User, command: string, message?: string) {
    logger.log(user.toString() + " used " + command + (message ? ": " + message : ""))
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })


bot.on("error", (err) => {
    console.error("Error: ", err)
})

bot.onText(/^\/start *$/, userMessage.start)
bot.onText(/^\/start (\S+) *$/, userMessage.register)
bot.onText(/\/state/, userMessage.getState)

bot.onText(/^\/playlist *$/, playlistMessage.selectPlaylist)
bot.onText(/^\/playlist (https:\/\/open\.spotify\.com\/playlist\/\S*) (.*)$/, playlistMessage.addPlaylist)

bot.onText(/\/volume/, volumeMessage.changeVolume)



bot.on('message', async (msg) => {
    try {
        assertIsNotUndefined(msg.text)
        if (msg.text.startsWith('/')) return
        const user = await User.getUser(msg.chat.id)
        user.checkRegistered()
        user.checkDj()
        log(user, "messsage", msg.text)

        logger.log("message: " + msg.text + ", " + user.toString())
        SongMessage.createSongMessage(user.chatId, msg.text)
    } catch (error) {
        console.error(error)
    }
})

bot.on("callback_query", async (query) => {
    try {
        assertIsNotUndefined(query.message)
        const user = await User.getUser(query.message.chat.id)
        user.checkRegistered()
        assertIsNotUndefined(query.data)
        await bot.answerCallbackQuery(query.id)

        if (query.data.startsWith("volume:")) {
            user.checkDj()
            await volumeMessage.onVolumeCallback(user, query.message!.message_id, query.data)
        } else if (query.data.startsWith("playlist:")) {
            user.checkAdmin()
            await playlistMessage.onPlaylistCallback(user, query.message!.message_id, query.data)
        } else if (query.data.startsWith("songMessage:")) {
            const [_, songMessageId, task] = query.data.split(":")
            const songMessage = await SongMessage.getSongMessage(parseInt(songMessageId))
            songMessage.receivedCallbackData(task)
        } else if (query.data.startsWith("queueMessage:")) {
            const [_, queueElementId, queueMessageId, task] = query.data.split(":")
            const queueElement = await QueueElement.getQueueElement(new ObjectId(queueElementId))
            queueElement.receivedCallbackData(parseInt(queueMessageId), task)
        }
    } catch (error) {
        console.error(error)
    }
})

export async function sendMessage(chatId: ChatId, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<number> {
    return (await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown", reply_markup: {
            inline_keyboard: keyboard
        }
    })).message_id
}

export async function editMessage(chat_id: number, message_id: number, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<boolean> {
    try {
        // logger.debug("Trying to edit message")
        await bot.editMessageText(text, { chat_id, message_id, parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } })
        return true
    } catch (error) {
        try {
            // logger.debug("Trying to edit message reply markup")
            await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, { chat_id, message_id })
            return true
        } catch (error: any) {
            if (error?.response?.body?.description?.startsWith("Bad Request: message is not modified")) {
                return false
            } else {
                logger.error("Error while editing message", error)
                return false
            }
        }
    }
}

export function registerCommands() {
    bot.setMyCommands([
        { command: "volume", description: "See and set the volume" },
        // { command: "queue", description: "See the queue" },
        // { command: "playlist", description: "See or set the active playlist, add new one with /playlist <uri> <name>" },
        // { command: "now", description: "See the currently playing song" },
        { command: "state", description: "Get your current state" },
        { command: "start", description: "Login to your Bot" },
    ], {
        scope: {
            type: 'all_private_chats'
        },
        language_code: 'en'
    })

    bot.setMyCommands([
        { command: "volume", description: "See and set the volume" },
        // { command: "queue", description: "See the queue" },
        // { command: "playlist", description: "See or set the active playlist, add new one with /playlist <uri> <name>" },
        // { command: "now", description: "See the currently playing song" },
        { command: "state", description: "Get your current state" },
        { command: "start", description: "Login to your Bot" },
    ], {
        scope: {
            type: "all_private_chats"
        },
        language_code: 'de'
    })
}

logger.log("Telegram bot started")
