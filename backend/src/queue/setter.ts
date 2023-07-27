import { ObjectId } from "mongodb";
import { SongUri } from "../spotify/song";
import { queueCollection } from "./queue";

export async function setPlayStartTime(id: ObjectId, time: Date) {
  queueCollection.updateOne({ _id: id }, { $set: { playStartTime: time } });
}

export async function setPosition(id: ObjectId, pos: number) {
  queueCollection.updateOne({ _id: id }, { $set: { pos } });
}

export async function addSong(songUri: SongUri, addedBy?: string) {
  queueCollection.insertOne({
    songUri,
    addedBy,
    type: "new"
  });
}
