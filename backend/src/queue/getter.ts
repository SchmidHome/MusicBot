import { ObjectId } from "mongodb";
import { queueCollection } from "./queue";

export function getPlaying() {
  return queueCollection.findOne({ type: "now" });
}

export function getNext() {
  return queueCollection.findOne({ type: "next" });
}

export function getQueued() {
  return queueCollection.find({ type: "queued" }).sort({ pos: 1 }).toArray();
}

export function getNew() {
  return queueCollection.find({ type: "new" }).toArray();
}

export function getId(id: string) {
  return queueCollection.findOne({ _id: new ObjectId(id) });
}

export async function getFullQueue() {
  return [
    ...(await queueCollection
      .find({ type: { $in: ["now", "next", "queued"] } })
      .sort({ pos: 1 })
      .toArray()),
    ...(await queueCollection.find({ type: { $in: ["new"] } }).toArray()),
  ];
}
