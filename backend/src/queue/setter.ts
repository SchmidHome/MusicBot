import { ObjectId } from "mongodb";
import { SongUri } from "../spotify/song";
import { queueCollection, queueLogger } from "./queue";
import { PositionType } from "./types";
import { sortQueue } from "./sort";
import { Mutex } from "async-mutex";

export function setPlayStartTime(id: ObjectId, time: Date) {
  return queueCollection.updateOne(
    { _id: id },
    { $set: { playStartTime: time } }
  );
}

export function setPosition(id: ObjectId, pos: number, type?: PositionType) {
  if (type)
    return queueCollection.updateOne({ _id: id }, { $set: { pos, type } });
  return queueCollection.updateOne({ _id: id }, { $set: { pos } });
}

export function setType(id: ObjectId, type: PositionType) {
  return queueCollection.updateOne({ _id: id }, { $set: { type } });
}

const addMutex = new Mutex();
export async function addSong(songUri: SongUri, addedBy?: string) {
  return addMutex.runExclusive(async () => {
    const _id = (
      await queueCollection.insertOne({
        songUri,
        addedBy: addedBy ? addedBy : undefined,
        type: "new",
      })
    ).insertedId;
    queueLogger.log(`Added ${songUri} to queue`);
    await sortQueue();
    return {
      songUri,
      addedBy,
      type: "new" as PositionType,
      _id,
    };
  });
}
