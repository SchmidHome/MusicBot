/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SERVER_URL: string;
  readonly PUBLIC_MOCK_SERVER?: "true" | "false";
  readonly PUBLIC_VOLUME_FETCH_INTERVAL?: number;
  readonly PUBLIC_QUEUE_FETCH_INTERVAL?: number;
  readonly PUBLIC_CURRENT_SONG_FETCH_INTERVAL?: number;
  readonly PUBLIC_LYRICS_FETCH_INTERVAL?: number;
  readonly PUBLIC_DISABLE_VOTING?: "true" | "false";
  readonly PUBLIC_DEFAULT_QR_LINK?: string;
  readonly PUBLIC_VOTE_LINK?: string;
}
