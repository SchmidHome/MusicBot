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
