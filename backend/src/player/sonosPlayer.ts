import { logger } from "../sonos/sonos";
import { applyNextSpotifyUri, getPlaying } from "../sonos/sonosPlayControl";
import { getPlayingState } from "../sonos/sonosPlayControl";
import { getVolume, setVolume } from "../sonos/sonosVolumeControl";
import { Player, PlayingState } from "./player";

export class SonosPlayer extends Player {
  getVolume(): Promise<number> {
    return getVolume();
  }

  setVolume(volume: number): Promise<void> {
    return setVolume(volume).then(() => {});
  }

  async getPlaying(): Promise<PlayingState> {
    const playing = await getPlaying();
    logger.log(
      `now: ${playing?.now?.spotifyUri}, next: ${playing?.next?.spotifyUri}`
    );
    return {
      now: playing
        ? { songUri: playing.now.spotifyUri, startDate: playing.now.startDate }
        : undefined,
      next: playing?.next ? { songUri: playing.next.spotifyUri } : undefined,
    };
  }

  async getPaused(): Promise<boolean> {
    const state = await getPlayingState();
    return !state;
  }

  async setNext(songUri: string): Promise<void> {
    await applyNextSpotifyUri(songUri);
  }
}
