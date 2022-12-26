import { ConsoleLogger } from './logger'
import { getCurrentTrack, getQueue, getScheduledTime, getVolume, setVolume } from './sonos'
import { getSong, addBackgroundPlaylist, selectBackgroundPlaylist, getBackgroundPlaylists, getActiveBackgroundPlaylist, getPlaylist } from './spotify'
import { assertIsMatch, assertIsNotNull, assertIsNotUndefined } from "./helper"
import { SongMessage } from './telegram/songMessage'
import { User } from './classes/user'
import { bot } from './telegram/telegramHelper'
import { ObjectId } from 'mongodb'
import { QueueElement } from './classes/queueElement'

const logger = new ConsoleLogger("telegram")

function log(user: User, command: string, message?: string) {
    logger.log(user.toString() + " used " + command + (message ? ": " + message : ""))
}

export default function startTelegram() {
    bot.on("error", (err) => {
        console.error("Error: ", err)
    })

    // ############################################## START
    bot.onText(/^\/start *$/, async (msg) => {
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
    })

    bot.onText(/^\/start (\S+) *$/, async (msg, match) => {
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
    })

    // ############################################## SEARCH TRACK

    bot.on("callback_query", async (query) => {
        try {
            assertIsNotUndefined(query.message)
            const user = await User.getUser(query.message.chat.id)
            user.checkRegistered()
            assertIsNotUndefined(query.data)
            await bot.answerCallbackQuery(query.id)

            // if (query.data.startsWith("/queue ")) {
            //     user.checkDj()
            //     await onAddSongCallback(user, query.data, query.message!.message_id)
            // } else if (query.data.startsWith("/rem ")) {
            //     user.checkDj()
            //     await onRemoveSongCallback(user, query.data, query.message!.message_id)
            // } else 
            if (query.data.startsWith("/volume ")) {
                user.checkDj()
                await onVolumeCallback(user, query.data, query.message!.message_id)
            } else if (query.data.startsWith("/playlist ")) {
                user.checkAdmin()
                await onPlaylistCallback(user, query.data, query.message!.message_id)
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

    // ############################################## SEARCH/ADD/REMOVE SONG
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

    // async function onAddSongCallback(user: User, data: string, message_id: number) {
    //     log(user, data)

    //     user.checkRegistered()

    //     const uri = data.substring("/queue ".length)
    //     await bot.editMessageReplyMarkup(replyMarkup_Clear(), { chat_id: user.chatId, message_id })

    //     const song = await getSong(uri)

    //     if (await songPlayedRecently(song)) {
    //         bot.sendMessage(user.chatId, "not again...")
    //     } else {
    //         logger.log(`${userToString(user)} added ${song.name} to queue`)
    //         if (await addToQueue(uri)) {
    //             const songPos = (await getPositionInQueue(uri))
    //             const songTime = await getScheduledTime(uri)

    //             await bot.editMessageReplyMarkup(replyMarkup_RemoveFromQueue(uri), { chat_id: user.chatId, message_id: message_id })

    //             await bot.sendMessage(user.chatId, `Song added to queue (position ${songPos + 1})\nplaying at ${songTime.toLocaleTimeString()}`)

    //             // add dj to cache
    //             await setDj(song.spotifyUri, user.name, songTime)

    //         } else {
    //             await bot.sendMessage(user.chatId, "Could not add song to queue")
    //         }
    //     }
    // }
    // async function onRemoveSongCallback(user: User, data: string, message_id: number) {
    //     log(user, data)
    //     const uri = data.substring("/rem ".length)
    //     await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id })
    //     //delay 5 seconds
    //     await new Promise(resolve => setTimeout(resolve, 5000))
    //     if (await removeFromQueue(uri)) {
    //         await bot.editMessageReplyMarkup(replyMarkup_Clear(), { chat_id: user.chatId, message_id: message_id })
    //         await bot.sendMessage(user.chatId, "Song removed from queue")

    //         // remove dj from cache
    //         await removeDj(uri)

    //     } else {
    //         await bot.sendMessage(user.chatId, "Could not remove song from queue")
    //     }
    // }

    // ############################################## GET/SET DEFAULT PLAYLIST

    bot.onText(/^\/playlist *$/, async (msg, match) => {
        try {
            const user = await User.getUser(msg.chat.id)
            user.checkRegistered()
            user.checkDj()
            log(user, "/playlist")
            // show current playlist and add buttons for each playlist
            const playlists = await getBackgroundPlaylists()
            const buttons = playlists.map((playlist) => {
                return { "text": playlist.name, "callback_data": "/playlist " + playlist.name }
            })
            let msgText = `Current playlist:\n*${(await getActiveBackgroundPlaylist())?.name}*`
            let msgSent = await bot.sendMessage(user.chatId, msgText, {
                parse_mode: "Markdown", reply_markup: {
                    "inline_keyboard": user.state == 'admin' ? buttons.map(v => [v]) : [[]]
                }
            })

            // set timeout to delete buttons
            setTimeout(async () => {
                try {
                    await bot.editMessageReplyMarkup({ "inline_keyboard": [] }, { chat_id: user.chatId, message_id: msgSent.message_id })
                } catch (error) { }
            }, 10000)
        } catch (error) {
            console.error(error)
        }
    })

    bot.onText(/^\/playlist (https:\/\/open\.spotify\.com\/playlist\/\S*) (.*)$/, async (msg, match) => {
        try {
            const user = await User.getUser(msg.chat.id)
            user.checkRegistered()
            user.checkAdmin()
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
        } catch (error) {
            console.error(error)
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
        try {
            const user = await User.getUser(msg.chat.id)
            assertIsMatch(match)
            user.update()

            switch (user.state) {
                case 'unknown':
                    bot.sendMessage(user.chatId, "You are not registered!")
                    break
                case "user":
                    bot.sendMessage(user.chatId, "You are a user!")
                    break
                case "dj":
                    bot.sendMessage(user.chatId, "You are a dj!")
                    break
                case 'admin':
                    bot.sendMessage(user.chatId, "You are an admin!")
                    break
                default:
                    bot.sendMessage(user.chatId, "This should not have happened!")
                    throw new Error("Unknown state: " + user.state)
            }
        } catch (error) {
            console.error(error)
        }
    })

    // ############################################## QUEUE
    bot.onText(/\/queue/, async (msg, match) => {
        try {
            const user = await User.getUser(msg.chat.id)
            log(user, "/queue")
            bot.sendMessage(user.chatId, "Queue:\n" + (await Promise.all((await getQueue()).map(getSong).map(async s =>
                `*${(await s).name}*\n${(await s).artist} (${(await getScheduledTime((await s).spotifyUri)).toLocaleTimeString()})`))).join("\n\n"),
                { parse_mode: "Markdown" })
        } catch (error) {
            console.error(error)
        }
    })

    // ############################################## PLAYING
    bot.onText(/\/playing/, async (msg, match) => {
        try {
            const user = await User.getUser(msg.chat.id)
            log(user, "/playing")
            const currentUri = await getCurrentTrack()
            if (!currentUri) {
                bot.sendMessage(user.chatId, "No song is playing")
            } else {
                const currentSong = (await getSong(currentUri))
                bot.sendMessage(user.chatId, "Currently playing:\n" + currentSong.name + " by " + currentSong.artist)
            }
        } catch (error) {
            console.error(error)
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
        try {
            const user = await User.getUser(msg.chat.id)
            user.checkRegistered()
            user.checkDj()

            const volume = roundNearest5(await getVolume())
            sendVolumeMessage(user, volume)
        } catch (error) {
            console.error(error)
        }
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
        logger.log(`${user.toString()} set volume to ${volume}`)
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
    ], {
        scope: {
            type: 'all_private_chats'
        },
        language_code: 'en'
    })

    bot.setMyCommands([
        { command: "volume", description: "See and set the volume" },
        { command: "queue", description: "See the queue" },
        { command: "playlist", description: "See or set the active playlist, add new one with /playlist <uri> <name>" },
        { command: "playing", description: "See the currently playing song" },
        { command: "state", description: "Get your current state" },
        { command: "start", description: "Login to your Bot" },
    ], {
        scope: {
            type: "all_private_chats"
        },
        language_code: 'de'
    })

    logger.log("Telegram bot started")

}
