import { OptionalId } from "mongodb";
import { collection } from "../mongodb";
import { sendMessage } from "../telegram/telegramHelper";

type UserState = "unknown" | "user" | "dj" | "admin"

type DbUser = OptionalId<{
    chatId: number
    name?: string
    state: UserState
}>

export class User {
    private static userCollection = collection<DbUser>("users")
    private static users: { [userId: string]: User | undefined } = {}

    static async getAllRegisteredUserIds() {
        return (await this.userCollection.find({ state: { $ne: "unknown" } }).toArray()).map(user => user.chatId)
    }

    static async getUser(chatId: number) {
        let user = this.users[chatId]
        if (!user) {
            let dbUser: DbUser | null = await this.userCollection.findOne({ chatId })
            if (!dbUser) {
                dbUser = { chatId: chatId, state: "unknown" }
                await this.userCollection.insertOne(dbUser)
            }
            user = new User(dbUser)
        }
        return user
    }
    private async save() {
        await User.userCollection.updateOne({ chatId: this.chatId }, { $set: this.dbUser })
    }
    async update() {
        this.dbUser = await User.userCollection.findOne({ chatId: this.chatId }) || { chatId: this.chatId, state: "unknown" }
        await this.save()
    }

    private constructor(
        private dbUser: DbUser
    ) {
        setInterval(() => { this.update() }, 1000 * 60)
    }

    isRegistered(): this is { name: string } {
        return this.dbUser.state !== "unknown"
    }
    isDj(): this is { name: string, state: "dj" | "admin" } {
        return this.dbUser.state === "dj" || this.dbUser.state === "admin"
    }
    isAdmin(): this is { name: string, state: "admin" } {
        return this.dbUser.state === "admin"
    }

    checkRegistered() {
        if (!this.isRegistered()) {
            this.sendNotRegisteredMessage()
            throw new Error("User is not registered")
        }
    }
    checkDj() {
        if (!this.isDj()) {
            this.sendNotDjMessage()
            throw new Error("User is not a DJ")
        }
    }
    checkAdmin() {
        if (!this.isAdmin()) {
            this.sendNotDjMessage()
            throw new Error("User is not an admin")
        }
    }

    get chatId() {
        return this.dbUser.chatId
    }
    get name() {
        return this.dbUser.name
    }
    async setName(name: string) {
        this.dbUser.name = name
        if (this.dbUser.state === "unknown") {
            this.dbUser.state = "user"
        }
        await this.save()
    }
    get state() {
        return this.dbUser.state
    }
    async setState(state: UserState) {
        this.dbUser.state = state
        await this.save()
    }

    toString() {
        return this.name || this.chatId
    }


    // message templates

    sendAlreadyRegisteredMessage() {
        sendMessage(this.chatId, `You are already registered, ${this.name}!`)
    }
    sendNotRegisteredMessage() {
        sendMessage(this.chatId, `You are not registered!\nPlease register with /start _your name_`)
    }
    sendNotDjMessage() {
        sendMessage(this.chatId, `You are not a DJ!`)
    }
    sendNotAdminMessage() {
        sendMessage(this.chatId, `You are not an admin!`)
    }

    sendWelcomeUnknownMessage() {
        sendMessage(this.chatId, `Welcome to the DJ Bot!\nPlease register with /start _your name_`)
    }
    sendWelcomeUserMessage() {
        sendMessage(this.chatId, `Welcome ${this.name}!`)
    }
}
