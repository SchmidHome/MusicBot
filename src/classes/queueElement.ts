import { ObjectId, OptionalId, WithId } from "mongodb";
import { collection } from "../mongodb";

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

    public updateQueueMessages() {
        // TODO
    }
}
