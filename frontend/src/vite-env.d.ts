/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SERVER_URL: string;
  readonly PUBLIC_VOLUME_FETCH_INTERVAL?: number;
  readonly PUBLIC_QUEUE_FETCH_INTERVAL?: number;
  readonly PUBLIC_CURRENT_SONG_FETCH_INTERVAL?: number;
  readonly PUBLIC_LYRICS_FETCH_INTERVAL?: number;
}
