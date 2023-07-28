import { SPOTIFY_PLAYER_CODE } from "../lib/config";
import { ConsoleLogger } from "../lib/logger";
import { Song, SongUri } from "../spotify/song";
import { getSong } from "../spotify/songCache";
import { setupDonePromise, spotify } from "../spotify/spotify";
import { Player, PlayingState } from "./player";

export class SpotifyPlayer extends Player {
  private logger = new ConsoleLogger("SpotifyPlayer");

  constructor() {
    super();
    this.logger.log("SpotifyPlayer initialized");
    this.init();
  }

  async init() {
    await setupDonePromise;
    try {
      const res = (await spotify.authorizationCodeGrant(SPOTIFY_PLAYER_CODE))
        .body;
      this.logger.log("The token expires in " + res.expires_in);
      spotify.setAccessToken(res.access_token);
      spotify.setRefreshToken(res.refresh_token);
    } catch (error) {
      var authorizeURL = spotify.createAuthorizeURL(
        ["user-read-playback-state", "user-modify-playback-state"],
        "state"
      );
      this.logger.error("TOKEN EXPIRED");
      this.logger.debug(authorizeURL);
      process.exit(1);
    }

    const playing = (await spotify.getMyCurrentPlaybackState()).body;
    this.logger.debug(JSON.stringify(playing));

    const devices = (await spotify.getMyDevices()).body.devices;
    this.logger.debug(JSON.stringify(devices));
  }

  async getVolume(): Promise<number> {
    return 0;
  }

  async setVolume(volume: number): Promise<void> {
    await spotify.setVolume(volume);
  }

  async getPlayingState(): Promise<PlayingState> {
    throw new Error("getPlayingState not implemented.");
  }

  async setNext(songUri: SongUri): Promise<void> {
    throw new Error("setNext not implemented.");
  }
}
