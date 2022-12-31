import { ObjectId, OptionalId, WithId } from "mongodb";
import { InlineKeyboardButton } from "node-telegram-bot-api";
import { ConsoleLogger } from "../logger";
import { collection } from "../mongodb";
import { getSong, songToString } from "../spotify";
import { SongMessage } from "./songMessage";
import { editMessage, sendMessage } from "../telegram/telegram";
import { Song } from "../types";
import { User } from "./user";
import { BLACKLIST } from "../config";

const logger = new ConsoleLogger("QueueElement")

export type votedType = "star" | "up" | "down"
export type positionType = "new" | number | "next" | "now" | "played" | "removed"

function isVotedType(value: string): value is votedType {
    return value === "star" || value === "up" || value === "down"
}

type DbQueueMessage = { chatId: number, messageId: number, voted?: votedType }

type DbQueueElement = OptionalId<{
    djChatId?: number
    spotifyUri: string
    position: positionType
    playStartTime?: Date
    messages: DbQueueMessage[]
}>

export class QueueElement {
    private static queueCollection = collection<DbQueueElement>("queueElements")
    private static queue: { [id: string]: QueueElement } = {}

    static async getPlaying() {
        let element = await this.queueCollection.findOne({ position: "now" })
        if (!element) return undefined
        return this.getQueueElement(element._id)
    }
    static async getNext() {
        let element = await this.queueCollection.findOne({ position: "next" })
        if (!element) return undefined
        return this.getQueueElement(element._id)
    }
    static async getQueue() {
        let elements = await this.queueCollection.find({ position: { $gte: 0 } }).sort({ position: 1 }).toArray()
        return Promise.all(elements.map(e => this.getQueueElement(e._id)))
    }
    static async getNextAndQueue() {
        let next = await this.getNext()
        let queue = await this.getQueue()
        if (next)
            return [next, ...queue]
        else
            return queue
    }
    static async getNew() {
        let elements = await this.queueCollection.find({ position: "new" }).toArray()
        return Promise.all(elements.map(e => this.getQueueElement(e._id)))
    }

    static async songPlayedRecently(song: Song) {

        // check blacklist
        if (BLACKLIST.includes(song.spotifyUri.split(":", 3)[2])) return true

        // check last played
        let elements = await this.queueCollection.find({ spotifyUri: song.spotifyUri }).toArray()
        if (elements.length === 0) return false

        let now = new Date()
        for (let element of elements) {
            if (element.position === "played") {
                // check if played in the last 2 hours
                if (element.playStartTime && element.playStartTime.getTime() + 1000 * 60 * 60 * 2 > now.getTime()) {
                    return true
                }
            } else if (element.position === "removed") {
                // ignore removed songs
            } else {
                // in queue, playing, return true
                return true
            }
        }

        //TODO check similar titles
        return false
    }

    static async sortQueue() {
        let next = await this.getNext()
        let elements = [...await this.getQueue(), ...await this.getNew()]
        let startPos = next ? 1 : 0

        elements = elements.sort((a, b) => {
            let aVotes = a.voteSummary
            let bVotes = b.voteSummary
            if (aVotes === bVotes) {
                if (typeof a.position === "number" && typeof b.position === "number") {
                    return a.position - b.position
                } else if (typeof a.position === "number") {
                    return -1
                } else {
                    return 1
                }
            }
            return bVotes - aVotes
        })

        await Promise.all(elements.map((e, i) => e.setPosition(startPos + i)))
        await this.updateTime()
    }
    static async updateTime() {
        const faderTime = 1000 * 12

        let playing = await this.getPlaying()
        if (!playing) return
        if (!playing.playStartTime) return

        let time = playing.playStartTime.getTime() + (await playing.getSong()).duration_ms + faderTime / 2

        let next = await this.getNext()
        if (next) {
            await next.setPlayStartTime(new Date(time - faderTime))
            time += (await next.getSong()).duration_ms - faderTime
        }

        let queue = await this.getQueue()
        for (let element of queue) {
            await element.setPlayStartTime(new Date(time - faderTime))
            time += (await element.getSong()).duration_ms - faderTime
        }
        this.updateAllMessages()
    }

    static async getQueueElement(id: ObjectId) {
        let element = this.queue[id.toHexString()]
        if (!element) {
            let dbElement = await this.queueCollection.findOne({ _id: id })
            if (!dbElement) {
                throw new Error("Queue element not found")
            }
            element = new QueueElement(dbElement)
            await element.save()
        }
        return element
    }
    static async createNewQueueElement(djChatId: number, spotifyUri: string) {
        const id = (await this.queueCollection.insertOne({
            djChatId,
            spotifyUri,
            position: "new",
            messages: []
        })).insertedId
        return this.getQueueElement(id)
    }
    static async createPlayingQueueElement(spotifyUri: string) {
        const id = (await this.queueCollection.insertOne({
            spotifyUri,
            position: "now",
            messages: []
        })).insertedId
        return this.getQueueElement(id)
    }
    static async createNextQueueElement(spotifyUri: string) {
        const id = (await this.queueCollection.insertOne({
            spotifyUri,
            position: "next",
            messages: []
        })).insertedId
        return this.getQueueElement(id)
    }
    private save() {
        return QueueElement.queueCollection.updateOne({ _id: this.id }, { $set: this.dbElement })
    }

    static async updateAllMessages() {
        let allElements = await this.queueCollection.find({}).toArray()
        for (let { _id } of allElements) {
            (await this.getQueueElement(_id)).updateMessages()
        }
    }

    private constructor(
        private dbElement: WithId<DbQueueElement>
    ) {
        QueueElement.queue[this.id.toHexString()] = this
    }

    get id() {
        return this.dbElement._id
    }
    get spotifyUri() {
        return this.dbElement.spotifyUri
    }

    get position() {
        return this.dbElement.position
    }
    async setPosition(position: positionType) {
        if (this.position == position) return
        logger.debug(`Setting position of ${(await this.getSong()).name} to ${position}`)
        this.dbElement.position = position
        await this.save()
    }

    get playStartTime() {
        return this.dbElement.playStartTime
    }
    async setPlayStartTime(playTime: Date) {
        if (this.playStartTime && Math.abs(this.playStartTime.getTime() - playTime.getTime()) < 1000) return
        logger.debug(`Setting playStartTime of ${(await this.getSong()).name} to ${playTime}`)
        this.dbElement.playStartTime = playTime
        await this.save()
    }

    async getDj() {
        if (!this.dbElement.djChatId) return undefined
        return await User.getUser(this.dbElement.djChatId)
    }

    get votes() {
        return this.dbElement.messages.map(m => m.voted).reduce((votes, vote) => {
            if (vote)
                votes[vote] += 1
            return votes
        }, { star: 0, up: 0, down: 0 })
    }
    get voteSummary() {
        const votes = this.votes
        return votes.star * 2 + votes.up - votes.down
    }

    public getPositionString() {
        let atString = this.playStartTime ? " um " + this.playStartTime.toLocaleTimeString() : ""
        switch (this.position) {
            case "now":
                return "Jetzt:"
            case "played":
                return "Bereits" + atString + " gespielt:"
            case "new":
                return "Neuer Song:"
            case "next":
                return "Als nächstes:"
            case "removed":
                return "Von Admin entfernt:"
            default:
                return "Position " + (this.position + 1) + atString + ":"
        }
    }
    public async getSong() {
        return await getSong(this.spotifyUri)
    }
    public async getSongString(withImage: boolean) {
        return songToString(await this.getSong(), withImage)
    }
    public getVotesString() {
        let text = ""
        if (this.votes.star)
            text += "⭐️ " + this.votes.star + " "
        if (this.votes.up)
            text += "👍 " + this.votes.up + " "
        if (this.votes.down)
            text += "👎 " + this.votes.down + " "
        return text
    }
    public async getDjString() {
        let dj = await this.getDj()
        if (dj) {
            return "Hinzugefügt von " + dj.name
        }
        return undefined
    }
    public async getString() {
        const djStr = await this.getDjString()
        const votesStr = this.getVotesString()
        return this.getPositionString() + "\n"
            + (votesStr ? votesStr + "\n" : "")
            + (djStr ? djStr + "\n" : "")
            + "\n"
            + await this.getSongString(this.position !== "played")
    }

    private async updateQueueMessages() {
        // logger.debug("Updating queue messages for " + (await this.getSong()).name)
        let chatIds = (await User.getAllRegisteredUserIds()).filter(u => u != this.dbElement.djChatId)
        for (let chatId of chatIds) {
            const msg = this.dbElement.messages.find(m => m.chatId === chatId)
            if (msg) {
                await this.updateQueueMessage(msg)
            } else {
                if (typeof this.position === "number") {
                    await this.createQueueMessage(chatId)
                }
            }
        }
    }
    private async updateQueueMessage(msg: DbQueueMessage) {
        // logger.debug("Updating queue message for chat " + msg.chatId)
        let text: string
        let buttons: InlineKeyboardButton[][] = []
        let user = await User.getUser(msg.chatId)

        text = await this.getString()

        // buttons
        if (this.position !== "now" && this.position !== "played" && this.position !== "next") {
            buttons = [[
                {
                    text: "⭐️",
                    callback_data: `queueMessage:${this.id}:${msg.messageId}:star`,
                },
                {
                    text: "👍",
                    callback_data: `queueMessage:${this.id}:${msg.messageId}:up`
                },
                {
                    text: "👎",
                    callback_data: `queueMessage:${this.id}:${msg.messageId}:down`
                }
            ]]
            switch (msg.voted) {
                case "star":
                    buttons[0][0].text = "[⭐️]"
                    break
                case "up":
                    buttons[0][1].text = "[👍]"
                    break
                case "down":
                    buttons[0][2].text = "[👎]"
                    break
            }
            if (user.isAdmin()) {
                buttons[0].push({
                    text: "❌",
                    callback_data: `queueMessage:${this.id}:${msg.messageId}:remove`
                })
            }
        }
        await editMessage(msg.chatId, msg.messageId, text, buttons)
    }
    private async createQueueMessage(chatId: number) {
        let newMsg = {
            messageId: await sendMessage(chatId, "Neuer Song hinzugefügt!"),
            chatId,
        }
        this.dbElement.messages.push(newMsg)
        await this.save()
        await this.updateQueueMessage(newMsg)
    }

    public async updateMessages() {
        // logger.debug("Updating queue element messages")
        if (this.dbElement.djChatId) {
            try {
                await (await SongMessage.getFromQueueElementId(this.dbElement._id)).updateMessage()
            } catch (e) {
                logger.error("Error updating song message: " + e)
            }
        }
        await this.updateQueueMessages()
    }

    private async changeVote(msgId: number, vote: "star" | "up" | "down") {
        let queueElement = this.dbElement.messages.find(m => m.messageId === msgId)
        if (!queueElement) {
            throw new Error("Queue element not found")
        }
        if (queueElement.voted === vote) {
            queueElement.voted = undefined
        } else {
            queueElement.voted = vote
        }
        await this.save()
        await this.updateQueueMessage(queueElement)
    }

    public async receivedCallbackData(msgId: number, data: string) {
        if (isVotedType(data)) {
            await this.changeVote(msgId, data)
        } else if (data === "remove") {
            if (this.position !== "now" && this.position !== "played" && this.position !== "next") {
                await this.setPosition("removed")
            }
        }
    }
}

setTimeout(() => {
    QueueElement.updateAllMessages()
}, 1000)

setInterval(() => {
    QueueElement.sortQueue()
}, 1000 * 5)
