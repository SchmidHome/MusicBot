import type { MutexInterface } from "async-mutex";
import { Mutex } from "async-mutex";

/**
 * Single threaded read-preferring read write lock
 */
class RWLock {
  protected _readerCount: number = 0;
  protected _writerCount: number = 0;
  protected lock: Mutex = new Mutex();
  protected release: MutexInterface.Releaser = () => {};

  public get readerCount(): number {
    return this._readerCount;
  }

  public get writerCount(): number {
    return this._writerCount;
  }

  public async withRead<T>(f: () => Promise<T>): Promise<T> {
    const release = await this.acquireRead();
    try {
      return await f();
    } finally {
      release();
    }
  }

  public async withWrite<T>(f: () => Promise<T>): Promise<T> {
    const release = await this.acquireWrite();
    try {
      return await f();
    } finally {
      release();
    }
  }

  public async acquireRead(): Promise<() => void> {
    const readerCount = ++this._readerCount;
    // The first reader locks
    if (readerCount === 1) {
      this.release = await this.lock.acquire();
    }
    return () => {
      const readerCount = --this._readerCount;
      // The last reader unlocks
      if (readerCount === 0) {
        this.release();
      }
    };
  }

  public async acquireWrite(): Promise<() => void> {
    ++this._writerCount;
    this.release = await this.lock.acquire();
    return () => {
      --this._writerCount;
      this.release();
    };
  }

  public isLocked(): boolean {
    return this.lock.isLocked();
  }

  public async waitForUnlock(): Promise<void> {
    return this.lock.waitForUnlock();
  }
}
