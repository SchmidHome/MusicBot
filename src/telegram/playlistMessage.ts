import TelegramBot from "node-telegram-bot-api"
import { User } from "../classes/user"
import { assertIsMatch, assertIsNotNull } from "../helper"
import { addBackgroundPlaylist, getActiveBackgroundPlaylist, getBackgroundPlaylists, getPlaylist, selectBackgroundPlaylist } from "../spotify"
import { editMessage, log, sendMessage } from "./telegram"

export async function selectPlaylist(msg: TelegramBot.Message) {
    try {
        const user = await User.getUser(msg.chat.id)
        user.checkRegistered()
        user.checkDj()
        log(user, "/playlist")
        // show current playlist and add buttons for each playlist
        const playlists = await getBackgroundPlaylists()
        const buttons = playlists.map((playlist) => {
            return { "text": playlist.name, "callback_data": "playlist:" + playlist.name }
        })
        let msgText = `Current playlist:\n*${(await getActiveBackgroundPlaylist())?.name}*`

        let msgSent = await sendMessage(user.chatId, msgText, user.state == 'admin' ? buttons.map(v => [v]) : [[]])

        // set timeout to delete buttons
        setTimeout(async () => {
            await editMessage(user.chatId, msgSent, msgText)
        }, 10000)
    } catch (error) {
        console.error(error)
    }
}

export async function addPlaylist(msg: TelegramBot.Message, match: RegExpExecArray | null) {
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
            await sendMessage(user.chatId, `Added playlist ${name} to background playlists`)
        } catch (error) {
            await sendMessage(user.chatId, "Could not add playlist")
        }
    } catch (error) {
        console.error(error)
    }
}

export async function onPlaylistCallback(user: User, message_id: number, data: string) {
    log(user, data)
    const name = data.split(":")[1]
    await selectBackgroundPlaylist(name)
    await editMessage(user.chatId, message_id, `Selected playlist *${name}* as background playlist`, [])
}
