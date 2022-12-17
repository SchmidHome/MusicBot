export enum UserState {
    unknown = 0,
    user,
    dj,
    admin,
}

export interface User {
    chatId: number,
    name?: string,
    state: UserState,
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
    duration: number
}

export interface Playlist {
    id: string
    name: string
    songs: Song[]
}
