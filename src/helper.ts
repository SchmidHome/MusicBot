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

// UNDEFINED
export function isUndefined(obj: anything): obj is undefined { return obj === undefined }
export function isNotUndefined(obj: anything): obj is Exclude<anything, undefined> { return !isUndefined(obj) }
export function assertIsNotUndefined(obj: anything): asserts obj is Exclude<anything, undefined> {
    if (isUndefined(obj)) {
        throw new Error("obj is undefined")
    }
}

// STRING
export function isString(obj: anything): obj is string { return typeof obj === "string" }


export function assertIsMatch(match: RegExpExecArray | null): asserts match is RegExpExecArray {
    if (!match) throw new Error("match is undefined")
}
