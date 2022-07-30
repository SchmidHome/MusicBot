import { bot } from "./telegram"
import { RegisteredUser, User, UserState } from "./types"

type anything = boolean | number | string | object | undefined | null

export function isRegistered(user: User): user is RegisteredUser {
    return user.name !== undefined && user.state !== UserState.unknown
}
export function assertIsRegistered(user: User): asserts user is RegisteredUser {
    if (!isRegistered(user)) {
        bot.sendMessage(user.chatId, "You are not registered!\nPlease type /start <your_name>")
        throw new Error("user is not registered")
    }
}

export function assertIsNotUndefined(obj: anything): asserts obj is Exclude<anything, undefined> {
    if (obj === undefined) {
        throw new Error("obj is undefined")
    }
}

export function assertIsMatch(match: RegExpExecArray | null): asserts match is RegExpExecArray {
    if (!match) throw new Error("match is undefined")
}
