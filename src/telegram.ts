import { assert } from 'console'
import TelegramBot, { Message } from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN } from "./config"

import { assertIsMatch, assertIsNotNull, assertIsNotUndefined, assertIsRegistered, isRegistered } from "./helper"
import { ConsoleLogger } from './logger'
import { db } from './mongodb'
import { addToQueue, getCurrentTrack, getPositionInQueue, getQueue, getScheduledTime, getVolume, removeFromQueue, setVolume } from './sonos'
import { uriToSong, querySong, songPlayedRecently, addBackgroundPlaylist, selectBackgroundPlaylist, getBackgroundPlaylists, getActiveBackgroundPlaylist, getPlaylist } from './spotify'
import { User, UserState } from "./types"
import { getUser, setUser, userToString } from "./userDatabase"

const logger = new ConsoleLogger("telegram")

function log(user: User, command: string, message?: string) {
    logger.log(userToString(user) + " used " + command + (message ? ": " + message : ""))
}

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

const djCache = db.collection<{ spotifyUri: string, name: string, validUntil: number }>("djCache")
export async function getDj(spotifyUri: string) {
    const dj = await djCache.findOne({ spotifyUri })
    if (dj && dj.validUntil > Date.now()) {
        return dj.name
    } else {
        return undefined
    }
}
export async function setDj(spotifyUri: string, name: string, playTime: Date) {
    await djCache.updateOne({ spotifyUri }, { $set: { spotifyUri, name, validUntil: playTime.getTime() + 30 * 60 * 1000 } }, { upsert: true })
}
export async function removeDj(spotifyUri: string) {
    await djCache.deleteOne({ spotifyUri })
}


export default function startTelegram() {
    bot.on("error", (err) => {
        console.error("Error: ", err)
    })

    // ############################################## START
    bot.onText(/^\/start *$/, async (msg) => {
        const user = await getUser(msg.chat.id)
        log(user, "/start")
        if (isRegistered(user)) {
            bot.sendMessage(user.chatId, "You are already registered, " + user.name + "!")
        } else {
            await bot.sendMessage(user.chatId, "Welcome to the bot!")
            await bot.sendMessage(user.chatId, "Please type /start <your_name>")
        }
    })

    bot.onText(/^\/start (\S+) *$/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        assertIsMatch(match)
        log(user, "/start", match[1])

        if (isRegistered(user)) {
            bot.sendMessage(user.chatId, "You are already registered, " + user.name + "!")
        } else {
            const username = match[1]
            setUser(user.chatId, username, UserState.user)
            await bot.sendMessage(user.chatId, `Welcome ${username}!`)
            logger.log(`${userToString(await getUser(user.chatId))} registered`)
        }
    })

    // ############################################## SEARCH TRACK
    async function searchTrackMessage(msg: Message) {
        const user = await getUser(msg.chat.id)
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
        const user = await getUser(query.message.chat.id)
        assertIsRegistered(user)
        assertIsNotUndefined(query.data)
        await bot.answerCallbackQuery(query.id)

        if (query.data.startsWith("/queue ")) {
            await onAddSongCallback(user, query.data, query.message!.message_id)
        } else if (query.data.startsWith("/rem ")) {
            await onRemoveSongCallback(user, query.data, query.message!.message_id)
        } else if (query.data.startsWith("/volume ")) {
            await onVolumeCallback(user, query.data, query.message!.message_id)
        } else if (query.data.startsWith("/playlist ")) {
            await onPlaylistCallback(user, query.data, query.message!.message_id)
        }
    })

    // ############################################## SEARCH/ADD/REMOVE SONG
    bot.on('message', async (msg) => {
        assertIsNotUndefined(msg.text)
        if (msg.text.startsWith('/')) return
        const user = await getUser(msg.chat.id)
        assertIsRegistered(user)
        log(user, "messsage", msg.text)

        logger.log("message: " + msg.text + ", " + userToString(user))
        switch (user.state) {
            case UserState.dj:
            case UserState.admin:
                searchTrackMessage(msg)
                break
        }
    })

    async function onAddSongCallback(user: User, data: string, message_id: number) {
        log(user, data)

        assertIsRegistered(user)

        const uri = data.substring("/queue ".length)
        await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id })

        const song = await uriToSong(uri)

        if (await songPlayedRecently(song)) {
            bot.sendMessage(user.chatId, "not again...")
        } else {
            logger.log(`${userToString(user)} added ${song.name} to queue`)
            if (await addToQueue(uri)) {
                const songPos = (await getPositionInQueue(uri))
                const songTime = await getScheduledTime(uri)

                await bot.editMessageReplyMarkup({ "inline_keyboard": [[{ "text": "Remove from Queue", "callback_data": "/rem " + uri }]] }, { chat_id: user.chatId, message_id: message_id })

                await bot.sendMessage(user.chatId, `Song added to queue (position ${songPos + 1})\nplaying at ${songTime.toLocaleTimeString()}`)

                // add dj to cache
                await setDj(song.spotifyUri, user.name, songTime)

            } else {
                await bot.sendMessage(user.chatId, "Could not add song to queue")
            }
        }
    }
    async function onRemoveSongCallback(user: User, data: string, message_id: number) {
        log(user, data)
        const uri = data.substring("/rem ".length)
        await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id })
        //delay 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000))
        if (await removeFromQueue(uri)) {
            await bot.editMessageReplyMarkup({ "inline_keyboard": [[{ "text": "Add to Queue", "callback_data": "/queue " + uri }]] }, { chat_id: user.chatId, message_id: message_id })
            await bot.sendMessage(user.chatId, "Song removed from queue")

            // remove dj from cache
            await removeDj(uri)

        } else {
            await bot.sendMessage(user.chatId, "Could not remove song from queue")
        }
    }

    // ############################################## GET/SET DEFAULT PLAYLIST

    bot.onText(/^\/playlist *$/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        assertIsRegistered(user)
        log(user, "/playlist")
        // show current playlist and add buttons for each playlist
        const playlists = await getBackgroundPlaylists()
        const buttons = playlists.map((playlist) => {
            return { "text": playlist.name, "callback_data": "/playlist " + playlist.name }
        })
        let msgText = `Current playlist:\n*${(await getActiveBackgroundPlaylist())?.name}*`
        let msgSent = await bot.sendMessage(user.chatId, msgText, {
            parse_mode: "Markdown", reply_markup: {
                "inline_keyboard": user.state == UserState.admin ? buttons.map(v => [v]) : [[]]
            }
        })

        // set timeout to delete buttons
        setTimeout(async () => {
            try {
                await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: msgSent.message_id })
            } catch (error) { }
        }, 10000)
    })

    bot.onText(/^\/playlist (https:\/\/open\.spotify\.com\/playlist\/\S*) (.*)$/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        assertIsRegistered(user)
        assertIsMatch(match)
        log(user, "/playlist", match[1] + match[2])

        try {
            const uri = match[1]
            const name = match[2]

            const playlist = await getPlaylist(uri, name)
            assertIsNotNull(playlist)
            await addBackgroundPlaylist(name, uri)
            await selectBackgroundPlaylist(name)
            await bot.sendMessage(user.chatId, `Added playlist ${name} to background playlists`)
        } catch (error) {
            await bot.sendMessage(user.chatId, "Could not add playlist")
        }
    })

    async function onPlaylistCallback(user: User, data: string, message_id: number) {
        log(user, data)
        const name = data.substring("/playlist ".length)
        selectBackgroundPlaylist(name)
        await bot.sendMessage(user.chatId, `Selected playlist *${name}* as background playlist`, { parse_mode: "Markdown" })
    }

    // ############################################## STATE
    bot.onText(/\/state/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
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

    // ############################################## QUEUE
    bot.onText(/\/queue/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        log(user, "/queue")
        bot.sendMessage(user.chatId, "Queue:\n" + (await Promise.all((await getQueue()).map(uriToSong).map(async s =>
            `*${(await s).name}*\n${(await s).artist} (${(await getScheduledTime((await s).spotifyUri)).toLocaleTimeString()})`))).join("\n\n"),
            { parse_mode: "Markdown" })
    })

    // ############################################## PLAYING
    bot.onText(/\/playing/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        log(user, "/playing")
        const currentUri = await getCurrentTrack()
        if (!currentUri) {
            bot.sendMessage(user.chatId, "No song is playing")
        } else {
            const currentSong = (await uriToSong(currentUri))
            bot.sendMessage(user.chatId, "Currently playing:\n" + currentSong.name + " by " + currentSong.artist)
        }
    })


    // ############################################## VOLUME
    async function sendVolumeMessage(user: User, volume: number) {
        let msg = await bot.sendMessage(user.chatId, "Volume: " + volume, {
            parse_mode: "Markdown", reply_markup: {
                "inline_keyboard": [
                    [
                        { "text": "Decrease", "callback_data": "/volume -" },
                        { "text": "Increase", "callback_data": "/volume +" },
                    ],
                ]
            }
        })

        // set timeout to delete buttons
        setTimeout(async () => {
            try {
                await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: msg.message_id })
            } catch (error) { }
        }, 5000)
    }

    bot.onText(/\/volume/, async (msg, match) => {
        const user = await getUser(msg.chat.id)
        const volume = roundNearest5(await getVolume())
        sendVolumeMessage(user, volume)
    })
    async function onVolumeCallback(user: User, data: string, message_id: number) {
        log(user, "/volume", data)
        let volume
        if (data.endsWith("+")) {
            volume = (roundNearest5(await getVolume()) + 5)
        } else {
            volume = (roundNearest5(await getVolume()) - 5)
        }
        if (volume < 0) volume = 0
        if (volume > 100) volume = 100
        logger.log(`${userToString(user)} set volume to ${volume}`)
        await setVolume(volume)
        await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: message_id })
        await sendVolumeMessage(user, volume)
    }

    function roundNearest5(num: number) {
        return Math.round(num / 5) * 5;
    }

    // ############################################## REGISTER COMMANDS

    bot.setMyCommands([
        { command: "volume", description: "See and set the volume" },
        { command: "queue", description: "See the queue" },
        { command: "playlist", description: "See or set the active playlist, add new one with /playlist <uri> <name>" },
        { command: "playing", description: "See the currently playing song" },
        { command: "state", description: "Get your current state" },
        { command: "start", description: "Login to your Bot" },
    ])

    logger.log("Telegram bot started")

}


