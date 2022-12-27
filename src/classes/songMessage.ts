import { ObjectId, OptionalId, WithId } from "mongodb";
import { InlineKeyboardButton } from "node-telegram-bot-api";
import { QueueElement } from "./queueElement";
import { User } from "./user";
import { ConsoleLogger } from "../logger";
import { collection } from "../mongodb";
import { querySpotify, songToString } from "../spotify";
import { editMessage, sendMessage } from "../telegram/telegram";

const logger = new ConsoleLogger("SongMessage")

type DbSongMessage = OptionalId<{
    messageId: number
    chatId: number
    queueElementId?: ObjectId
    searchText: string
    searchIndex: number
}>

export class SongMessage {
    private static songMessageCollection = collection<DbSongMessage>("songMessages")
    private static songMessages: { [id: string]: SongMessage | undefined } = {}

    static async getFromQueueElementId(id: ObjectId) {
        let dbSongMessage = await this.songMessageCollection.findOne({ queueElementId: id })
        if (!dbSongMessage) {
            throw new Error("Song message not found")
        }
        return this.getSongMessage(dbSongMessage.messageId)
    }
    static async getSongMessage(messageId: number) {
        let songMessage = this.songMessages[messageId]
        if (!songMessage) {
            let dbSongMessage: DbSongMessage | null = await this.songMessageCollection.findOne({ messageId })
            if (!dbSongMessage) {
                throw new Error("Song message not found")
            }
            songMessage = new SongMessage(dbSongMessage)
        }
        return songMessage
    }
    static async createSongMessage(chatId: number, searchText: string) {
        let dbSongMessage: DbSongMessage = {
            messageId: await sendMessage(chatId, "Searching..."),
            chatId,
            searchText,
            searchIndex: 0
        }
        await this.songMessageCollection.insertOne(dbSongMessage)
        let songMessage = new SongMessage(dbSongMessage)
        await songMessage.save()
        await songMessage.updateMessage()
        return songMessage
    }
    static async updateAllMessages() {
        let allMessages = await this.songMessageCollection.find({}).toArray()
        for (let { chatId, messageId, _id } of allMessages) {
            try {
                if ((await User.getUser(chatId)).isDj()) {
                    (await this.getSongMessage(messageId)).updateMessage()
                } else {
                    logger.debug("User is not DJ, deleting message")
                    await this.songMessageCollection.deleteOne({ _id })
                }
            } catch (error) {
                logger.error("Error while updating message", error)
                await this.songMessageCollection.deleteOne({ _id })
            }
        }
    }

    private save() {
        return SongMessage.songMessageCollection.updateOne({ messageId: this.dbSongMessage.messageId }, { $set: this.dbSongMessage })
    }

    private constructor(
        private dbSongMessage: DbSongMessage
    ) {
        SongMessage.songMessages[this.dbSongMessage.messageId] = this
    }

    public getSong() {
        return querySpotify(this.dbSongMessage.searchText, this.dbSongMessage.searchIndex)
    }

    public async updateMessage() {
        logger.debug("Updating message")
        let text: string
        let keyboard: InlineKeyboardButton[][] = []
        const song = await this.getSong()
        if (this.dbSongMessage.queueElementId) {
            // Already in Queue
            let queueElement = await QueueElement.getQueueElement(this.dbSongMessage.queueElementId)
            text = await queueElement.getString()

        } else if (this.queueTimeout !== undefined) {
            // Adding to Queue
            if (!song) throw new Error("Trying to add song to queue, but no song found")
            text = "Adding to queue...\n" + songToString(song)
            keyboard = [[
                { text: "Cancel", callback_data: `songMessage:${this.dbSongMessage.messageId}:cancel` }
            ]]
        } else {
            // Not in Queue
            keyboard = [
                [
                    { text: "Previous", callback_data: `songMessage:${this.dbSongMessage.messageId}:${this.dbSongMessage.searchIndex - 1}` },
                    { text: "Next", callback_data: `songMessage:${this.dbSongMessage.messageId}:${this.dbSongMessage.searchIndex + 1}` }
                ],
                [{ text: "Add to queue", callback_data: `songMessage:${this.dbSongMessage.messageId}:add` }]
            ]
            if (!song) {
                if (this.dbSongMessage.searchIndex > 0) {
                    text = "No more results"
                    keyboard = [[
                        { text: "Previous", callback_data: `songMessage:${this.dbSongMessage.messageId}:${this.dbSongMessage.searchIndex - 1}` }
                    ]]
                } else {
                    text = "No results"
                    keyboard = []
                }
            } else {
                if (!song) throw new Error("Trying to add song to queue, but no song found")
                text = songToString(song)
                if (this.dbSongMessage.searchIndex == 0) { keyboard[0].shift() }
            }
        }
        await editMessage(this.dbSongMessage.chatId, this.dbSongMessage.messageId, text, keyboard)
    }

    public get messageId() {
        return this.dbSongMessage.messageId
    }
    public get chatId() {
        return this.dbSongMessage.chatId
    }

    private async setIndex(index: number) {
        logger.info("Setting index", index)
        this.dbSongMessage.searchIndex = index
        await this.save()
        await this.updateMessage()
    }

    private queueTimeout: NodeJS.Timeout | undefined
    private async addToQueue() {
        this.queueTimeout = setTimeout(async () => {
            logger.info("Adding to queue")
            const song = await this.getSong()
            if (!song) throw new Error("Trying to add song that doesn't exist")
            const e = await QueueElement.createQueueElement(this.chatId, song.spotifyUri)
            this.dbSongMessage.queueElementId = e.id
            await this.save()
            await this.updateMessage()
            await e.updateMessages()
        }, 10 * 1000)
        this.updateMessage()
    }

    private cancelAddToQueue() {
        logger.info("Removing from queue")
        clearTimeout(this.queueTimeout)
        this.updateMessage()
    }

    public async receivedCallbackData(data: string) {
        logger.info("Received callback data", data)
        if (data == "add") {
            await this.addToQueue()
        } else if (data == "cancel") {
            this.cancelAddToQueue()
        } else {
            await this.setIndex(parseInt(data))
        }
    }
}

setTimeout(() => {
    SongMessage.updateAllMessages()
}, 1000)
