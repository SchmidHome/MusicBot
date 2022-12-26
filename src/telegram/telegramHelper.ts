import TelegramBot, { ChatId } from "node-telegram-bot-api";
import { TELEGRAM_TOKEN } from "../config";

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

export async function sendMessage(chatId: ChatId, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<number> {
    return (await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown", reply_markup: {
            inline_keyboard: keyboard
        }
    })).message_id
}

export async function editMessage(chat_id: number, message_id: number, text: string, keyboard: TelegramBot.InlineKeyboardButton[][] = []): Promise<void> {
    let ret = await bot.editMessageText(text, { chat_id, message_id, parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } })
    if (!ret) throw new Error("Message not found")
    console.log("editMessage", chat_id, message_id, text, keyboard, ret)
}
