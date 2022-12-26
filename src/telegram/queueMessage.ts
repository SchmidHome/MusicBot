import { ObjectId, OptionalId, WithId } from "mongodb";
import { InlineKeyboardButton } from "node-telegram-bot-api";
import { QueueElement } from "../classes/queueElement";
import { ConsoleLogger } from "../logger";
import { collection } from "../mongodb";
import { editMessage, sendMessage } from "./telegramHelper";

const logger = new ConsoleLogger("QueueMessage")

type votedType = "star" | "up" | "down"

function isVotedType(value: string): value is votedType {
    return value === "star" || value === "up" || value === "down"
}

type DbQueueMessage = OptionalId<{
    messageId: number
    queueElementId: ObjectId
    chatId: number
    voted?: votedType
}>

export class QueueMessage {
    private static queueMessageCollection = collection<DbQueueMessage>("QueueMessages")
    private static queueMessages: { [chatIdQueueElement: string]: QueueMessage | undefined } = {}

    public static async getQueueMessage(messageId: number, queueElementId?: ObjectId) {
        let message = this.queueMessages[messageId]
        if (!message) {
            let dbQueueMessage: DbQueueMessage | null = await this.queueMessageCollection.findOne({ messageId })
            if (!dbQueueMessage) {
                if (!queueElementId) throw new Error("Queue message not found")
                message = await this.createQueueMessage(messageId, queueElementId)
            } else {
                message = new QueueMessage(dbQueueMessage)
            }
        }
        return message
    }
    private static async createQueueMessage(chatId: number, queueElementId: ObjectId) {
        let dbQueueMessage: DbQueueMessage = {
            messageId: await sendMessage(chatId, "New Song added!"),
            chatId,
            queueElementId: queueElementId
        }
        await this.queueMessageCollection.insertOne(dbQueueMessage)
        let message = new QueueMessage(dbQueueMessage)
        await message.save()
        await message.updateMessage()
        return message
    }

    private save() {
        return QueueMessage.queueMessageCollection.updateOne({ messageId: this.dbQueueMessage.messageId }, { $set: this.dbQueueMessage })
    }

    private constructor(dbQueueMessage: DbQueueMessage)
    private constructor(
        private dbQueueMessage: DbQueueMessage
    ) { }

    public async updateMessage() {
        logger.debug("Updating message")
        let text: string
        let buttons: InlineKeyboardButton[][] = []

        let queueElement = await QueueElement.getQueueElement(this.dbQueueMessage.queueElementId)
        text = await queueElement.getString()

        // buttons
        if (queueElement.position !== "playing" && queueElement.position !== "played") {
            buttons = [[
                {
                    text: "⭐️",
                    callback_data: `queueMessage:${this.dbQueueMessage.messageId}:star`
                },
                {
                    text: "👍",
                    callback_data: `queueMessage:${this.dbQueueMessage.messageId}:up`
                },
                {
                    text: "👎",
                    callback_data: `queueMessage:${this.dbQueueMessage.messageId}:down`
                }
            ]]
            switch (this.dbQueueMessage.voted) {
                case "star":
                    buttons[0].splice(0, 1)
                    break
                case "up":
                    buttons[0].splice(1, 1)
                    break
                case "down":
                    buttons[0].splice(2, 1)
                    break
            }

            await editMessage(this.dbQueueMessage.chatId, this.dbQueueMessage.messageId, text, buttons)
        }
    }

    get vote() {
        return this.dbQueueMessage.voted
    }

    private async changeVote(vote: "star" | "up" | "down") {
        this.dbQueueMessage.voted = vote
        await this.save()
        await this.updateMessage()
    }

    public async receivedCallbackData(data: string) {
        if (isVotedType(data)) {
            await this.changeVote(data)
        }
    }
}
