import { ConsoleLogger } from "../lib/logger";
import { Song, SongUri } from "../spotify/song";
import { getSong } from "../spotify/songCache";
import { Player, PlayingState } from "./player";

export class EmptyPlayer extends Player {
  private logger = new ConsoleLogger("EmptyPlayer");
  constructor() {
    super();
    this.logger.log("EmptyPlayer initialized");
  }

  private volume = 0;
  async getVolume(): Promise<number> {
    this.logger.log("getVolume called");
    return this.volume;
  }

  async setVolume(volume: number): Promise<void> {
    this.logger.log(`setVolume called with ${volume}`);
    this.volume = volume;
  }

  private startDate?: Date;
  private playing?: Song;
  private next?: Song;
  async getPlaying(): Promise<PlayingState> {
    this.logger.log("getPlayingState called");
    return {
      now: this.playing
        ? {
            songUri: this.playing.songUri,
            startDate: this.startDate || new Date(),
          }
        : undefined,
      next: this.next ? { songUri: this.next.songUri } : undefined,
    };
  }

  async getPaused(): Promise<boolean> {
    this.logger.log("getPaused called");
    return this.startDate === undefined;
  }

  async setNext(songUri: SongUri): Promise<void> {
    let song = await getSong(songUri);
    this.logger.log(`setNext called with ${song.name}`);
    // this.next = song;
    if (!this.playing) {
      this.playing = song;
      this.startTimeout();
    } else {
      this.next = song;
    }
  }

  startTimeout() {
    if (this.playing) {
      this.logger.log(`${this.playing.name} started`);
      this.startDate = new Date();
      setTimeout(() => {
        if (this.playing) {
          this.logger.log(`${this.playing.name} finished`);
          this.playing = this.next;
          this.next = undefined;
          this.startDate = undefined;
        }
        this.startTimeout();
      }, this.playing.duration_ms);
    }
  }
}
