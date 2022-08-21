import { User, UserState } from "./types"
import { JSONFileHandler } from "@idot-digital/simplecache"


const file = new JSONFileHandler("data/users.json", 1000)


const userStates: { [id: number]: User | undefined } = {}

async function loadUsers() {
    const users: User[] = await file.get()
    users.forEach(u => userStates[u.chatId] = u)
}

function saveUsers() {
    return file.set(Object.values(userStates))
}

loadUsers()



export function getUser(chatID: number): User {
    if (!userStates[chatID]) {
        userStates[chatID] = {
            state: UserState.unknown,
            chatId: chatID,
        }
    }
    return userStates[chatID]!
}

export function setUser(chatID: number, name: string, state: UserState): void {
    userStates[chatID] = {
        name,
        state,
        chatId: chatID,
    }
    saveUsers()
}

export function setUserState(chatID: number, state: UserState): void {
    getUser(chatID)!.state = state
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
