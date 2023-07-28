import { Song, SongUri } from "../spotify/song";

export type PlayingState = {
  paused: boolean;
  now?: { songUri: SongUri; startDate: Date };
  next?: { songUri: SongUri };
};

export abstract class Player {
  abstract getVolume(): Promise<number>;
  abstract setVolume(volume: number): Promise<void>;

  abstract getPlayingState(): Promise<PlayingState>;
  abstract setNext(song: SongUri): Promise<void>;
}
