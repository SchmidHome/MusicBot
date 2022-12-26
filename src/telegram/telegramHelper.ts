import TelegramBot, { ChatId } from "node-telegram-bot-api";
import { TELEGRAM_TOKEN } from "../config";
import { ConsoleLogger } from "../logger";

const logger = new ConsoleLogger("telegramHelper")

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

export async function sendMessage(chatId: ChatId, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<number> {
    return (await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown", reply_markup: {
            inline_keyboard: keyboard
        }
    })).message_id
}

export async function editMessage(chat_id: number, message_id: number, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<boolean> {
    try {
        logger.debug("Trying to edit message")
        await bot.editMessageText(text, { chat_id, message_id, parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } })
        return true
    } catch (error) {
        try {
            logger.debug("Trying to edit message reply markup")
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
