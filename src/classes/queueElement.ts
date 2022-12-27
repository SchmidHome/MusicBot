import { ObjectId, OptionalId, WithId } from "mongodb";
import { InlineKeyboardButton } from "node-telegram-bot-api";
import { ConsoleLogger } from "../logger";
import { collection } from "../mongodb";
import { getSong, songToString } from "../spotify";
import { SongMessage } from "../telegram/songMessage";
import { editMessage, sendMessage } from "../telegram/telegramHelper";
import { User } from "./user";

const logger = new ConsoleLogger("QueueElement")

export type votedType = "star" | "up" | "down"

function isVotedType(value: string): value is votedType {
    return value === "star" || value === "up" || value === "down"
}

type DbQueueMessage = { chatId: number, messageId: number, voted?: votedType }

type DbQueueElement = OptionalId<{
    djChatId: number
    spotifyUri: string
    position: number | "playing" | "played" | "new"
    playStartTime?: Date
    messages: DbQueueMessage[]
}>

export class QueueElement {
    private static queueCollection = collection<DbQueueElement>("queueElements")
    private static queue: { [id: string]: QueueElement } = {}

    static async getQueueElement(id: ObjectId) {
        let element = this.queue[id.toHexString()]
        if (!element) {
            let dbElement = await this.queueCollection.findOne({ _id: id })
            if (!dbElement) {
                throw new Error("Queue element not found")
            }
            element = new QueueElement(dbElement)
        }
        return element
    }
    static async createQueueElement(djChatId: number, spotifyUri: string) {
        const id = (await this.queueCollection.insertOne({
            djChatId,
            spotifyUri,
            position: "new",
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
    ) { }

    get id() {
        return this.dbElement._id
    }
    get spotifyUri() {
        return this.dbElement.spotifyUri
    }

    get position() {
        return this.dbElement.position
    }
    async setPosition(position: number) {
        this.dbElement.position = position
        await this.save()
    }
    get playTime() {
        return this.dbElement.playStartTime
    }
    async setPlayTime(playTime: Date) {
        this.dbElement.playStartTime = playTime
        await this.save()
    }


    get votes() {
        return this.dbElement.messages.map(m => m.voted).reduce((votes, vote) => {
            if (vote)
                votes[vote] += 1
            return votes
        }, { star: 0, up: 0, down: 0 })
    }

    public getPositionString() {
        let atString = this.playTime ? " (at " + this.playTime.toLocaleString() + ")" : ""
        switch (this.position) {
            case "playing":
                return "Now playing:"
            case "played":
                return "Played" + atString + ":"
            case "new":
                return "New song queued!"
            default:
                return "Position " + this.position + atString + ":"
        }
    }
    public async getSongString() {
        let song = await getSong(this.spotifyUri)
        return songToString(song)
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
    public async getString() {
        return this.getPositionString() + "\n" + this.getVotesString() + "\n" + await this.getSongString()
    }

    public async updateQueueMessages() {
        let chatIds = (await User.getAllRegisteredUserIds()).filter(u => u != this.dbElement.djChatId)
        for (let chatId of chatIds) {
            const msg = this.dbElement.messages.find(m => m.chatId === chatId)
            if (msg) {
                await this.updateQueueMessage(msg)
            } else {
                await this.createQueueMessage(chatId)
            }
        }
    }
    public async updateQueueMessage(msg: DbQueueMessage) {
        logger.debug("Updating queue message for chat " + msg.chatId)
        let text: string
        let buttons: InlineKeyboardButton[][] = []

        text = await this.getString()

        // buttons
        if (this.position !== "playing" && this.position !== "played") {
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
            await editMessage(msg.chatId, msg.messageId, text, buttons)
        }
    }
    public async createQueueMessage(chatId: number) {
        let newMsg = {
            messageId: await sendMessage(chatId, "New Song added!"),
            chatId,
        }
        this.dbElement.messages.push(newMsg)
        await this.save()
        await this.updateQueueMessage(newMsg)
    }

    public async updateMessages() {
        logger.debug("Updating queue element messages")
        await (await SongMessage.getFromQueueElementId(this.dbElement._id)).updateMessage()
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
        await this.updateMessages()
    }

    public async receivedCallbackData(msgId: number, data: string) {
        if (isVotedType(data)) {
            await this.changeVote(msgId, data)
        }
    }
}

setTimeout(() => {
    QueueElement.updateAllMessages()
}, 1000)
