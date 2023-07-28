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

export function getFullQueue() {
  return queueCollection
    .find({ type: { $regex: "$regex: /^(queued|next|now)$/" } })
    .sort({ pos: 1 })
    .toArray();
}

