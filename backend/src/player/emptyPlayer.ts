import { ConsoleLogger } from "../logger";
import { Song } from "../spotify/song";
import { Player } from "./player";

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

  private playing?: Song;
  private next?: Song;
  async getPlaying(): Promise<Song | undefined> {
    this.logger.log("getPlaying called");
    return this.playing;
  }

  async getNext(): Promise<Song | undefined> {
    this.logger.log("getNext called");
    return this.next;
  }

  async setNext(song: Song): Promise<void> {
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
      setTimeout(() => {
        if (this.playing) {
          this.logger.log(`${this.playing.name} finished`);
          this.playing = this.next;
          this.next = undefined;
        }
        this.startTimeout();
      }, this.playing.duration_ms);
    }
  }
}
