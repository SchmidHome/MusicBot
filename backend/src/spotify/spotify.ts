import SpotifyWebApi from "spotify-web-api-node";
import { ConsoleLogger } from "../lib/logger";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../lib/config";

export const loggerSpotify = new ConsoleLogger("spotify");

export const spotify = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
});
