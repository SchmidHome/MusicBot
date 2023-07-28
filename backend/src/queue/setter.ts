import { ObjectId } from "mongodb";
import { SongUri } from "../spotify/song";
import { queueCollection } from "./queue";
import { PositionType } from "./types";

export async function setPlayStartTime(id: ObjectId, time: Date) {
  queueCollection.updateOne({ _id: id }, { $set: { playStartTime: time } });
}

export async function setPosition(id: ObjectId, pos: number) {
  queueCollection.updateOne({ _id: id }, { $set: { pos } });
}

export async function setType(id: ObjectId, type: PositionType) {
  queueCollection.updateOne({ _id: id }, { $set: { type } });
}

export async function addSong(songUri: SongUri, addedBy?: string) {
  return {
    songUri,
    addedBy,
    type: "new" as PositionType,
    _id: (
      await queueCollection.insertOne({
        songUri,
        addedBy: addedBy ? addedBy : undefined,
        type: "new",
      })
    ).insertedId,
  };
}
