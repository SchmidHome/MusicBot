export enum UserState {
    unknown = 0,
    user,
    dj,
    admin,
}

export interface User {
    state: UserState,
    name?: string,
    chatId: number,
}
export interface RegisteredUser extends User {
    state: Exclude<UserState, UserState.unknown>,
    name: string,
}

export interface Song {
    name: string
    artist: string
    album: string
    imageUri: string
    spotifyUri: string
}
