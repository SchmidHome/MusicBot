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

export type Cached<T> = T & { validUntil: number }

export interface Lyrics {
    spotifyUri: string
    error: boolean
    syncType: string
    lines : {
        startTimeMs: number
        endTimeMs: number
        words: string
        syllables: string
    }[]
}
