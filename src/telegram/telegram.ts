import TelegramBot from "node-telegram-bot-api";
import { User } from "../classes/user";
import { TELEGRAM_TOKEN } from "../config";
import { ConsoleLogger } from "../logger";
import * as userMessage from "./userMessage";
import * as playlistMessage from "./playlistMessage";
import * as volumeMessage from "./volumeMessage";
import { assertIsNotUndefined, isEqual } from "../helper";
import { SongMessage } from "../classes/songMessage";
import { QueueElement } from "../classes/queueElement";
import { ObjectId } from "mongodb";
import { db } from "../mongodb";
import { Cached } from "../types";

export const logger = new ConsoleLogger("telegram")

export function log(user: User, command: string, message?: string) {
    logger.log(user.toString() + " used " + command + (message ? ": " + message : ""))
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })


bot.on("error", (err) => {
    console.error("Error: ", err)
})

bot.onText(/^\/start *$/, userMessage.start)
bot.onText(/^\/start (\S\S.+) *$/, userMessage.register)
bot.onText(/\/state/, userMessage.getState)

bot.onText(/^\/playlist *$/, playlistMessage.selectPlaylist)
bot.onText(/^\/playlist (https:\/\/open\.spotify\.com\/playlist\/\S*) (.*)$/, playlistMessage.addPlaylist)

bot.onText(/\/volume/, volumeMessage.showVolume)



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

type telegramMessage = {
    chatId: number,
    messageId: number,
    text: string,
    keyboard: TelegramBot.InlineKeyboardButton[][]
}

const messageCache = db.collection<telegramMessage>("telegramMessageCache")

export async function sendMessage(chatId: number, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<number> {
    const messageId = (await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown", reply_markup: {
            inline_keyboard: keyboard
        }
    })).message_id
    await messageCache.insertOne({ chatId, messageId, text, keyboard })
    return messageId
}

export async function editMessage(chat_id: number, message_id: number, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<boolean> {
    const message = await messageCache.findOne({ chatId: chat_id, messageId: message_id })
    if (!message) throw new Error("Message not found in cache")

    try {
        if(message.text !== text ) {
            await bot.editMessageText(text, { chat_id, message_id, parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } })
        } else if (!isEqual(message.keyboard, keyboard)) {
            await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, { chat_id, message_id })
        } else {
            return false
        }
    } catch (error) {
        logger.error("Error while editing message: " + error)
    }
    messageCache.updateOne({ chatId: chat_id, messageId: message_id }, { $set: { text, keyboard } })
    return true
}

export function registerCommands() {
    bot.setMyCommands([
        { command: "volume", description: "See and set the volume" },
        { command: "playlist", description: "See or set the active playlist, add new one with /playlist <uri> <name>" },
        // { command: "playing", description: "See the currently playing song" },
        // { command: "queue", description: "See the queue" },
        { command: "state", description: "Get your current state" },
        { command: "start", description: "Login to your Bot" },
    ], {
        scope: {
            type: 'all_private_chats'
        },
        language_code: 'en'
    })

    bot.setMyCommands([
        { command: "volume", description: "Sieh und ändere die Lautstärke" },
        { command: "playlist", description: "Sieh oder ändere die aktive Playlist, füge neue hinzu mit /playlist <uri> <name>" },
        // { command: "playing", description: "See the currently playing song" },
        // { command: "queue", description: "See the queue" },
        { command: "state", description: "Sieh deinen aktuellen Status" },
        { command: "start", description: "Melde dich an" },
    ], {
        scope: {
            type: "all_private_chats"
        },
        language_code: 'de'
    })
}

logger.log("Telegram bot started")
