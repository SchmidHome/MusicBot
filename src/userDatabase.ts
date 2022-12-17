import { User, UserState } from "./types"
import { db } from "./mongodb"

const users = db.collection<User>('users')

export async function getUser(chatId: number): Promise<User> {
    const user = await users.findOne({ chatId })
    if (!user) {
        await users.insertOne({ chatId, state: UserState.unknown })
        return { chatId, state: UserState.unknown }
    } else {
        return user
    }
}

export async function setUser(chatId: number, name: string, state: UserState) {
    users.updateOne({ chatId }, { $set: { name, state } }, { upsert: true })
}

export function setUserState(chatId: number, state: UserState): void {
    users.updateOne({ chatId }, { $set: { state } })
}

export function userToString(user: User): string {
    return `${user.chatId}: ${user.name} (${userStateToString(user.state)})`
}

export function userStateToString(state: UserState): string {
    switch (state) {
        case UserState.unknown: return "unknown"
        case UserState.user: return "user"
        case UserState.dj: return "dj"
        case UserState.admin: return "admin"
    }
}
