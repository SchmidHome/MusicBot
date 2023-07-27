import type { Song, Vote, CastedVote } from "../types";
import { customFetch } from "./functions";
import queue, { refreshQueue } from "./queue";

async function voteForSong(song: Song, vote: Vote): Promise<void> {
  const existingVote = getVoteForSong(song);
  let deleteVotePromise: Promise<void> | null = null;
  if (existingVote) deleteVotePromise = deleteVote(existingVote);

  // optimistic update of vote summary
  queue.update((queue) => {
    const index = queue.findIndex((qSong) => areSongsEqual(qSong, song));
    if (index === -1) return queue;
    const qSong = queue[index];
    return [
      ...queue.slice(0, index),
      {
        ...qSong,
        voteSummary: qSong.voteSummary + vote,
      },
      ...queue.slice(index + 1),
    ];
  });

  if (import.meta.env.PUBLIC_MOCK_SERVER) {
    const castedVote = {
      id: "pending",
      song,
      vote,
      timestamp: new Date(),
    };
    // instantly add vote to cache to prevent double voting by spamming the button
    votedSongs.push(castedVote);
    updateLocalStorage();

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    // update id when server responded
    castedVote.id = crypto.randomUUID();
    updateLocalStorage();
  } else {
    const castedVote = { id: "pending", song, vote, timestamp: new Date() };
    // instantly add vote to cache to prevent double voting by spamming the button
    votedSongs.push(castedVote);
    updateLocalStorage();

    const id = await customFetch<string>("/vote", {
      method: "POST",
      body: JSON.stringify({ vote }),
    });

    // update id when server responded
    castedVote.id = id;
    updateLocalStorage();
    // update queue since vote summary changed
    refreshQueue();
  }

  await deleteVotePromise;
}

async function deleteVote(castedVote: CastedVote): Promise<void> {
  // remove existing vote from cache
  const index = votedSongs.indexOf(castedVote);
  if (index !== -1) votedSongs.splice(index, 1);

  // optimistic update of vote summary
  queue.update((queue) => {
    const index = queue.findIndex((qSong) =>
      areSongsEqual(qSong, castedVote.song)
    );
    if (index === -1) return queue;
    const qSong = queue[index];
    return [
      ...queue.slice(0, index),
      {
        ...qSong,
        voteSummary: qSong.voteSummary - castedVote.vote,
      },
      ...queue.slice(index + 1),
    ];
  });
  if (!import.meta.env.PUBLIC_MOCK_SERVER) {
    await customFetch("/vote/" + castedVote.id, {
      method: "DELETE",
    });
    // update queue since vote summary changed
    refreshQueue();
  } else
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
}

let votedSongs: CastedVote[] = [];

function loadCastedVotes() {
  const value = localStorage.getItem("votedSongs");
  if (!value) return;
  // filter out votes older than 24 hours
  votedSongs = (JSON.parse(value) as CastedVote[])
    .map((ele) => ({
      ...ele,
      timestamp: new Date(ele.timestamp),
    }))
    .filter(
      ({ timestamp }) =>
        new Date().getTime() - timestamp.getTime() < 1000 * 60 * 60 * 24
    );
  updateLocalStorage();
}

export function getVoteForSong(song: Song): CastedVote | undefined {
  return votedSongs.find((votedSong) => areSongsEqual(votedSong.song, song));
}

function updateLocalStorage() {
  localStorage.setItem("votedSongs", JSON.stringify(votedSongs));
  //@ts-ignore
  window.votedSongs = votedSongs;
}

function areSongsEqual(song1: Song, song2: Song) {
  return song1.name === song2.name && song1.artist === song2.artist;
}

loadCastedVotes();

export default voteForSong;
