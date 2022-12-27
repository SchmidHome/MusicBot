import TelegramBot from "node-telegram-bot-api"
import { User } from "../classes/user"
import { getVolume, setVolume } from "../sonos/sonosVolumeControl"
import { editMessage, log, logger, sendMessage } from "./telegram"

async function updateVolumeMessage(user: User, messageId: number, volume: number) {
    const msg = await sendMessage(user.chatId, "Volume: " + volume)

    await editMessage(user.chatId, msg, "Volume: " + volume,
        [[
            { "text": "Decrease", "callback_data": `volume:-` },
            { "text": "Increase", "callback_data": `volume:+` }
        ]])
}

function roundNearest5(num: number) {
    return Math.round(num / 5) * 5;
}

export async function changeVolume(msg: TelegramBot.Message) {
    try {
        const user = await User.getUser(msg.chat.id)
        user.checkRegistered()
        user.checkDj()

        const volume = roundNearest5(await getVolume())

        const msgId = await sendMessage(user.chatId, "Volume: " + volume)
        updateVolumeMessage(user, msgId, volume)

        // set timeout to delete buttons
        setTimeout(async () => {
            await editMessage(user.chatId, msgId, "Volume: " + volume, [])
        }, 1000 * 10)

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
