import { ObjectId, OptionalId, WithId } from "mongodb";
import { collection } from "../mongodb";
import { getSong, songToString } from "../spotify";
import { QueueMessage } from "../telegram/queueMessage";
import { User } from "./user";

type DbQueueElement = OptionalId<{
    djChatId: number
    spotifyUri: string
    position: number | "playing" | "played" | "new"
    playStartTime?: Date
}>

export class QueueElement {
    private static queueCollection = collection<DbQueueElement>("queue")
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
        })).insertedId
        return this.getQueueElement(id)
    }
    private save() {
        return QueueElement.queueCollection.updateOne({ _id: this.id }, { $set: this.dbElement })
    }

    static async updateAllMessages() {
        let allElements = await this.queueCollection.find({}).toArray()
        for (let { _id } of allElements) {
            (await this.getQueueElement(_id)).updateQueueMessages()
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
    public async getString() {
        return this.getPositionString() + "\n" + await this.getSongString()
    }

    public async getQueueMessages() {
        let chatIds = (await User.getAllRegisteredUserIds()).filter(u => u != this.dbElement.djChatId)
        return Promise.all(chatIds.map(chatId => QueueMessage.getQueueMessage(chatId, this.id)))
    }

    public async updateQueueMessages() {
        return Promise.all((await this.getQueueMessages()).map(m => m.updateMessage()))
    }
}

setTimeout(() => {
    QueueElement.updateAllMessages()
}, 1000)
