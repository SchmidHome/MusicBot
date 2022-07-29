import dotenv from "dotenv"
import TelegramBot from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN } from "./config"
import { addToQueue, getCurrentTrack } from "./sonos"
import { querySong } from "./spotify"

console.clear()

dotenv.config()

console.log("connecting to telegram")
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

// ############################################## PASSWORDS
const passwords: { [name: string]: string | undefined } = {
    "Johannes": "theWorld",
    "Dylan": "theMoon",
}

// ############################################## USER STATES
enum UserState {
    unknown = 0,
    user,
    dj,
    admin,
}
const userStates: { [id: number]: UserState } = {}

function getUserState(chatID: number): UserState {
    return userStates[chatID] || UserState.unknown
}
function setUserState(chatID: number, state: UserState): void {
    userStates[chatID] = state
}

// ############################################## START

// no arguments
bot.onText(/^\/start *$/, async (msg) => {
    const chatID = msg.chat.id
    const userState = getUserState(chatID)
    if (userState !== UserState.unknown) {
        bot.sendMessage(chatID, "You are already registered")
    } else {
        await bot.sendMessage(chatID, "Welcome to the bot!")
        await bot.sendMessage(chatID, "Please type /start <your_name>")
    }
})



// ############################################## USER
bot.onText(/^\/start (\S+) *$/, async (msg, match) => {
    const chatID = msg.chat.id
    const userState = getUserState(chatID)
    if (userState !== UserState.unknown) {
        await bot.sendMessage(chatID, "You are already registered!")
    } else if (!match) {
        throw new Error("no match on /start, " + chatID + ", " + userState)
    } else {
        const username = match[1]
        if (passwords[username]) {
            await bot.sendMessage(chatID, "Please type /start <your name> <your password>")
        } else {
            setUserState(chatID, UserState.user)
            await bot.sendMessage(chatID, "Welcome " + username + "!")
        }
    }
})

// ############################################## DJ
bot.onText(/^\/dj (\S+) (\S+) *$/, async (msg, match) => {
    const chatId = msg.chat.id
    const userState = getUserState(chatId)
    if (userState === UserState.dj || userState === UserState.admin) {
        await bot.sendMessage(chatId, "You are already registered!")
    } else if (!match) {
        throw new Error("no match on /start, " + chatId + ", " + userState)
    } else {
        const username = match[1]
        const password = match[2]
        //check password
        if (passwords[username] && passwords[username] == password) {
            passwords[username] = undefined
            setUserState(chatId, UserState.dj)
            await bot.sendMessage(chatId, "Welcome " + username + "!")
        } else {
            await bot.sendMessage(chatId, "Wrong user or password!")
        }
    }
})

async function searchTrackMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id
    if (!msg.text) {
        bot.sendMessage(chatId, "Please type a song name")
    } else {
        const song = await querySong(msg.text)
        if (!song) {
            bot.sendMessage(chatId, "No song found")
        } else {
            let msg = `*${song.name}*\n${song.artist}\n${song.imageUri}`
            bot.sendMessage(chatId, msg, {
                parse_mode: "Markdown", reply_markup: {
                    "inline_keyboard": [[
                        {
                            "text": "Hinzufügen",
                            "callback_data": "/queue " + song.spotifyUri
                        },
                    ]]
                }
            })
        }
    }
}

bot.on("callback_query", async (query) => {
    const chatId = query.message!.chat.id
    const data = query.data!

    bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: chatId, message_id: query.message!.message_id })

    bot.answerCallbackQuery(query.id)

    if (data.startsWith("/queue ")) {
        const uri = data.substring("/queue ".length)

        if (await addToQueue(uri)) {
            bot.sendMessage(chatId, "Song added to queue")
        } else {
            bot.sendMessage(chatId, "Could not add song to queue")
        }
    }
})

// ############################################## ADMIN



function onMessageAdmin(msg: TelegramBot.Message): void {

}


// ############################################## MESSAGE PARSER
bot.on('message', (msg) => {
    if (!msg.text) return
    if (msg.text.startsWith('/')) return
    const chatId = msg.chat.id
    const userState = getUserState(chatId)
    console.log("message: " + msg.text + ", " + chatId + ", " + userState)
    switch (userState) {
        case UserState.unknown:
        // bot.sendMessage(chatId, "Please type /start <your_name>")
        // break
        case UserState.dj:
            searchTrackMessage(msg)
            break
        case UserState.admin:
            onMessageAdmin(msg)
            break
    }
})

// ##############################################
bot.onText(/\/state/, (msg, match) => {
    const chatId = msg.chat.id
    const userState = getUserState(chatId)
    switch (userState) {
        case UserState.unknown:
            bot.sendMessage(chatId, "You are not registered!")
            break
        case UserState.user:
            bot.sendMessage(chatId, "You are a user!")
            break
        case UserState.dj:
            bot.sendMessage(chatId, "You are a dj!")
            break
        case UserState.admin:
            bot.sendMessage(chatId, "You are an admin!")
            break
    }
})

bot.onText(/\/playing/, async (msg, match) => {
    const chatId = msg.chat.id
    const userState = getUserState(chatId)
    bot.sendMessage(chatId, "I am playing: " + await getCurrentTrack())
})

bot.onText(/\/echo (.+)/, (msg, match) => {
    if (!match) throw new Error("match is undefined")



    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id
    const resp = match[1] // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp)
})

// Listen for any kind of message. There are different kinds of
// messages.


bot.on("error", (err) => {
    console.log("Error: ", err)
})
