import { User, UserState } from "./types"
import { JSONFileHandler } from "@idot-digital/simplecache"


const file = new JSONFileHandler("users.json", 1000)


const userStates: { [id: number]: User | undefined } = {}
// //load and save from file
//     1340698323: { chatId: 1340698323, state: UserState.admin, name: "Johannes" },
//     5502414084: { chatId: 5502414084, state: UserState.admin, name: "Dylan" },
//     5514678326: { chatId: 5514678326, state: UserState.dj, name: "Leonhard" },
//     5162370082: { chatId: 5162370082, state: UserState.dj, name: "Bene" },
//     5316395698: { chatId: 5316395698, state: UserState.dj, name: "Espi" },
// }

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
