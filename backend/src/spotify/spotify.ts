import SpotifyWebApi from "spotify-web-api-node";
import { ConsoleLogger } from "../lib/logger";
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_PLAYER_CODE,
} from "../lib/config";

export const loggerSpotify = new ConsoleLogger("spotify");

export const spotify = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: "https://example.com/callback", // for client access
});

let setupDone: () => void;
export const setupDonePromise = new Promise<void>((resolve) => {
  setupDone = resolve;
});

async function setup() {
  let token = (await spotify.clientCredentialsGrant()).body;
  spotify.setAccessToken(token.access_token);
  loggerSpotify.log("Token refreshed");
  setTimeout(setup, (token.expires_in - 30) * 1000);
  setupDone();
}
setup();
