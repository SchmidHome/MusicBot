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

export function isDj(user: RegisteredUser): user is RegisteredUser & { state: UserState.dj | UserState.admin } {
    return user.state === UserState.dj || user.state === UserState.admin
}
export function assertIsDj(user: RegisteredUser): asserts user is RegisteredUser & { state: UserState.dj | UserState.admin } {
    if (!isDj(user)) {
        bot.sendMessage(user.chatId, "You are not a dj!\nPlease ask an admin to promote you")
        throw new Error("user is not dj")
    }
}

export function isAdmin(user: RegisteredUser): user is RegisteredUser & { state: UserState.admin } {
    return user.state === UserState.admin
}
export function assertIsAdmin(user: RegisteredUser): asserts user is RegisteredUser & { state: UserState.admin } {
    if (!isAdmin(user)) {
        bot.sendMessage(user.chatId, "You are not an admin!\nPlease ask an admin to promote you")
        throw new Error("user is not admin")
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

export function isNull(obj: anything): obj is null { return obj === null }
export function isNotNull(obj: anything): obj is Exclude<anything, null> { return !isNull(obj) }
export function assertIsNotNull(obj: anything): asserts obj is Exclude<anything, null> {
    if (isNull(obj)) {
        throw new Error("obj is null")
    }
}

export function isNullOrUndefined(obj: anything): obj is null | undefined { return isNull(obj) || isUndefined(obj) }
export function isNotNullOrUndefined(obj: anything): obj is Exclude<anything, null | undefined> { return !isNullOrUndefined(obj) }
export function assertIsNotNullOrUndefined(obj: anything): asserts obj is Exclude<anything, null | undefined> {
    if (isNullOrUndefined(obj)) {
        throw new Error("obj is null or undefined")
    }
}


// STRING
export function isString(obj: anything): obj is string { return typeof obj === "string" }


export function assertIsMatch(match: RegExpExecArray | null): asserts match is RegExpExecArray {
    if (!match) throw new Error("match is undefined")
}

export function between(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}
