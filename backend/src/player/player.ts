import { Song, SongUri } from "../spotify/song";

export type PlayingState = {
  now?: { songUri: SongUri; startDate: Date };
  next?: { songUri: SongUri };
};

export abstract class Player {
  abstract getVolume(): Promise<number>;
  abstract setVolume(volume: number): Promise<void>;

  abstract getPlaying(): Promise<PlayingState>;
  abstract getPaused(): Promise<boolean>;
  abstract setNext(song: SongUri): Promise<void>;
}
