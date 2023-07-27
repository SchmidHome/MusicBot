import { Song } from "../spotify/song";

export abstract class Player {
  abstract getVolume(): Promise<number>;
  abstract setVolume(volume: number): Promise<void>;

  abstract getPlaying(): Promise<Song | undefined>;
  abstract getNext(): Promise<Song | undefined>;
  abstract setNext(song: Song): Promise<void>;
}
