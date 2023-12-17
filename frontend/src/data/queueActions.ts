import { customFetch } from "./functions";
import type { QueueElement, SongElement } from "../types";

export async function addToQueue(song: SongElement): Promise<void> {
  await customFetch<void>("queue", {
    body: {
      songUri: song.songUri,
    },
    method: "POST",
  });
}
export async function removeFromQueue(song: QueueElement): Promise<void> {
  await customFetch<void>("queue", {
    body: {
      _id: song._id,
    },
    method: "DELETE",
  });
}

export async function moveToTop(song: Pick<QueueElement, "_id">): Promise<void> {
  await customFetch<void>("queueMove", {
    body: {
      _id: song._id,
      direction: -100
    },
    method: "POST",
  });
}
