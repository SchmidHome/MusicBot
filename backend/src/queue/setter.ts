import { ObjectId } from "mongodb";
import { SongUri } from "../spotify/song";
import { queueCollection } from "./queue";
import { PositionType } from "./types";
import { loggerQueue, sortQueue } from "./sort";

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

export async function addSong(songUri: SongUri, addedBy?: string) {
  const _id = (
    await queueCollection.insertOne({
      songUri,
      addedBy: addedBy ? addedBy : undefined,
      type: "new",
    })
  ).insertedId;
  loggerQueue.log(`Added ${songUri} to queue`);
  await sortQueue();
  return {
    songUri,
    addedBy,
    type: "new" as PositionType,
    _id,
  };
}
