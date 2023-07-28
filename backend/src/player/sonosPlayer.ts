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

  async getPlayingState(): Promise<PlayingState> {
    const state = await getPlayingState();
    const playing = await getPlaying();
    return {
        paused: state,
        now: playing ? { songUri: playing.now.spotifyUri, startDate: playing.now.startDate } : undefined,
        next: playing?.next ? { songUri: playing.next.spotifyUri } : undefined
    };
  }

  async setNext(songUri: string): Promise<void> {
    await applyNextSpotifyUri(songUri)
  }
}
