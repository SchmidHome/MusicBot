import dotenv from "dotenv"
import TelegramBot from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN } from "./config"

dotenv.config()

console.log("connecting to " + TELEGRAM_TOKEN)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

//! DEBUG
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    if (!match) throw new Error("match is undefined")
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});

bot.on("error", (err) => {
    console.log("Error: ", err)
})
