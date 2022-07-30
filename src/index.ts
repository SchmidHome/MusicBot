import { Message, BotCommandScopeAllPrivateChats } from "node-telegram-bot-api"
import { assertIsMatch, assertIsNotUndefined, assertIsRegistered, isRegistered } from "./helper"
import { addToQueue, getCurrentTrack, getSongQueue, getVolume, setVolume } from "./sonos"
import { addTrackFromDefaultPlaylist, getCurrentSongFromUri as getSongFromUri, querySong, songPlayedRecently } from "./spotify"
import { bot } from "./telegram"
import { User, UserState } from "./types"
import { getUser, setUser, userToString } from "./userDatabase"

console.clear()

// ############################################## START
bot.onText(/^\/start *$/, async (msg) => {
    const user = getUser(msg.chat.id)
    if (isRegistered(user)) {
        bot.sendMessage(user.chatId, "You are already registered, " + user.name + "!")
    } else {
        await bot.sendMessage(user.chatId, "Welcome to the bot!")
        await bot.sendMessage(user.chatId, "Please type /start <your_name>")
    }
})

bot.onText(/^\/start (\S+) *$/, async (msg, match) => {
    const user = getUser(msg.chat.id)
    assertIsMatch(match)

    if (isRegistered(user)) {
        bot.sendMessage(user.chatId, "You are already registered, " + user.name + "!")
    } else {
        const username = match[1]
        setUser(user.chatId, username, UserState.user)
        await bot.sendMessage(user.chatId, `Welcome ${username}!`)
        console.log(`${userToString(getUser(user.chatId))} registered`)
    }
})

// ############################################## SEARCH TRACK
export async function searchTrackMessage(msg: Message) {
    const user = getUser(msg.chat.id)
    assertIsRegistered(user)

    if (!msg.text) {
        bot.sendMessage(user.chatId, "Please type a song name")
    } else {
        const song = await querySong(msg.text)
        if (!song) {
            bot.sendMessage(user.chatId, "No song found")
        } else {
            let msg = `*${song.name}*\n${song.artist}\n${song.imageUri}`
            bot.sendMessage(user.chatId, msg, {
                parse_mode: "Markdown", reply_markup:
                    { "inline_keyboard": [[{ "text": "Add to Queue", "callback_data": "/queue " + song.spotifyUri }]] }
            })
        }
    }
}

bot.on("callback_query", async (query) => {
    assertIsNotUndefined(query.message)
    const user = getUser(query.message.chat.id)
    assertIsRegistered(user)
    assertIsNotUndefined(query.data)

    await bot.answerCallbackQuery(query.id)

    if (query.data.startsWith("/queue ")) {
        const uri = query.data.substring("/queue ".length)
        await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: query.message!.message_id })
        if (await songPlayedRecently(uri)) {
            bot.sendMessage(user.chatId, "not again...")
        } else {
            console.log(`${userToString(user)} added ${(await getSongFromUri(uri)).name} to queue`)
            if (await addToQueue(uri)) {
                bot.sendMessage(user.chatId, "Song added to queue")
            } else {
                bot.sendMessage(user.chatId, "Could not add song to queue")
            }
        }

    } else if (query.data.startsWith("/volume ")) {
        const volume = parseInt(query.data.substring("/volume ".length))
        if (volume >= 0 && volume <= 100) {
            console.log(`${userToString(user)} set volume to ${volume}`)
            await setVolume(volume)
            await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: query.message!.message_id })
            await sendVolumeMessage(user, volume)
        } else {
            await bot.sendMessage(user.chatId, "Invalid volume")
        }
    }
})

async function sendVolumeMessage(user: User, volume: number) {
    await bot.sendMessage(user.chatId, "Volume: " + volume, {
        parse_mode: "Markdown", reply_markup: {
            "inline_keyboard": [
                [{ "text": "Increase", "callback_data": "/volume " + (roundNearest5(await getVolume()) + 5) },
                { "text": "Decrease", "callback_data": "/volume " + (roundNearest5(await getVolume()) - 5) }],
            ]
        }
    })
}


// ############################################## MESSAGE PARSER
bot.on('message', (msg) => {
    assertIsNotUndefined(msg.text)
    if (msg.text.startsWith('/')) return
    const user = getUser(msg.chat.id)
    assertIsRegistered(user)

    console.log("message: " + msg.text + ", " + userToString(user))
    switch (user.state) {
        case UserState.dj:
        case UserState.admin:
            searchTrackMessage(msg)
            break
    }
})

// ##############################################
bot.onText(/\/state/, (msg, match) => {
    const user = getUser(msg.chat.id)
    assertIsMatch(match)

    switch (user.state) {
        case UserState.unknown:
            bot.sendMessage(user.chatId, "You are not registered!")
            break
        case UserState.user:
            bot.sendMessage(user.chatId, "You are a user!")
            break
        case UserState.dj:
            bot.sendMessage(user.chatId, "You are a dj!")
            break
        case UserState.admin:
            bot.sendMessage(user.chatId, "You are an admin!")
            break
    }
})

bot.onText(/\/queue/, async (msg, match) => {
    const user = getUser(msg.chat.id)
    bot.sendMessage(user.chatId, "Queue:\n" + (await Promise.all((await getSongQueue()).map(getSongFromUri))).map(s => s.name + " by " + s.artist).join("\n"))
})

bot.onText(/\/playing/, async (msg, match) => {
    const user = getUser(msg.chat.id)
    const currentUri = await getCurrentTrack()
    if (!currentUri) {
        bot.sendMessage(user.chatId, "No song is playing")
    } else {
        const currentSong = (await getSongFromUri(currentUri))
        bot.sendMessage(user.chatId, "Currently playing:\n" + currentSong.name + " by " + currentSong.artist)
    }
})

bot.onText(/\/volume/, async (msg, match) => {
    const user = getUser(msg.chat.id)
    const volume = roundNearest5(await getVolume())
    sendVolumeMessage(user, volume)
})

function roundNearest5(num: number) {
    return Math.round(num / 5) * 5;
}

// ############################################## QUEUE
setInterval(async () => {
    const queue = await getSongQueue()
    if (queue.length == 0) {
        addTrackFromDefaultPlaylist()
    }
}, 10 * 1000)

// ############################################## REGISTER COMMANDS

bot.setMyCommands([
    { command: "start", description: "Login to your Bot" },
    { command: "state", description: "Get your current state" },
    { command: "volume", description: "See and set the volume" },
    { command: "queue", description: "See the queue" },
    { command: "playing", description: "See the currently playing song" },
], {
    scope: { type: "all_private_chats" }
})


