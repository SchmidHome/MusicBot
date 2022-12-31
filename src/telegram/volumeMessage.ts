import TelegramBot from "node-telegram-bot-api"
import { User } from "../classes/user"
import { getVolume, setVolume } from "../sonos/sonosVolumeControl"
import { editMessage, log, logger, sendMessage } from "./telegram"

const timer: { [messageId: number]: NodeJS.Timeout | undefined } = {}

async function updateVolumeMessage(user: User, messageId: number | null, volume: number) {
    if (!messageId) {
        messageId = await sendMessage(user.chatId, "Lautstärke: " + volume)
    }

    for (const [_id, t] of [...Object.entries(timer), [messageId, undefined]]) {
        const id = Number(_id)
        clearTimeout(t)
        await editMessage(user.chatId, id, "Lautstärke: " + volume,
            [[
                { "text": "Leiser", "callback_data": `volume:-` },
                { "text": "Lauter", "callback_data": `volume:+` }
            ]])

        // set timeout to delete buttons
        timer[id] = setTimeout(async () => {
            await editMessage(user.chatId, id, "Lautstärke: " + volume, [])
            delete timer[id]
        }, 1000 * 10)
    }

    return messageId
}

function roundNearest5(num: number) {
    return Math.round(num / 5) * 5;
}

export async function changeVolume(msg: TelegramBot.Message) {
    try {
        const user = await User.getUser(msg.chat.id)
        user.checkRegistered()
        user.checkDj()

        let volume = roundNearest5(await getVolume())

        if (msg.text?.endsWith("+")) {
            volume += 5
        } else if (msg.text?.endsWith("-")) {
            volume -= 5
        }

        volume = Math.max(0, Math.min(100, volume))

        await setVolume(volume)

        await updateVolumeMessage(user, null, volume)
    } catch (error) {
        console.error(error)
    }
}

export async function onVolumeCallback(user: User, message_id: number, data: string) {
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
    await updateVolumeMessage(user, message_id, volume)
}
