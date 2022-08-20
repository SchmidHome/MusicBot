import { Message } from "node-telegram-bot-api"
import { assertIsMatch, assertIsNotUndefined, assertIsRegistered, isRegistered } from "./helper"
import { addToQueue, getCurrentTrack, getPositionInQueue, getQueue, getScheduledTime, getTrackInfo, getVolume, setVolume } from "./sonos"
import { addTrackFromDefaultPlaylist, getSongFromUri as getSongFromUri, querySong, songPlayedRecently } from "./spotify"
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
                bot.sendMessage(user.chatId, `Song added to queue (position ${await getPositionInQueue(uri)})\nplaying at ${(await getScheduledTime(uri)).toLocaleTimeString()}`)
            } else {
                bot.sendMessage(user.chatId, "Could not add song to queue")
            }
        }

    } else if (query.data.startsWith("/volume ")) {
        let volume
        if (query.data.endsWith("+")) {
            volume = (roundNearest5(await getVolume()) + 5)
        } else {
            volume = (roundNearest5(await getVolume()) - 5)
        }
        if (volume < 0) volume = 0
        if (volume > 100) volume = 100
        console.log(`${userToString(user)} set volume to ${volume}`)
        await setVolume(volume)
        await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: query.message!.message_id })
        await sendVolumeMessage(user, volume)
    }
})

async function sendVolumeMessage(user: User, volume: number) {
    let msg = await bot.sendMessage(user.chatId, "Volume: " + volume, {
        parse_mode: "Markdown", reply_markup: {
            "inline_keyboard": [
                [{ "text": "Increase", "callback_data": "/volume +" },
                { "text": "Decrease", "callback_data": "/volume -" }],
            ]
        }
    })

    setTimeout(async () => {
        try {
            await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: msg.message_id })
        } catch (error) { }
    }, 5000)
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
    bot.sendMessage(user.chatId, "Queue:\n" + (await Promise.all((await getQueue()).map(getSongFromUri).map(async s =>
        `*${(await s).name}*\n${(await s).artist} (${(await getScheduledTime((await s).spotifyUri)).toLocaleTimeString()})`))).join("\n\n"),
        { parse_mode: "Markdown" })
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
    const queue = await getQueue()
    if (queue.length == 0) {
        await addTrackFromDefaultPlaylist()
    }
}, 20 * 1000)

// ############################################## REGISTER COMMANDS

bot.setMyCommands([
    { command: "volume", description: "See and set the volume" },
    { command: "queue", description: "See the queue" },
    { command: "playing", description: "See the currently playing song" },
    { command: "state", description: "Get your current state" },
    { command: "start", description: "Login to your Bot" },
])
