import { customFetch } from "./functions";
import type { SongElement } from "../types";

export async function getSongs(search: string): Promise<SongElement[]> {
  const res = await customFetch<SongElement[]>("search", {
    body: {
      query: search,
      number: 10,
    },
    method: "POST",
  });

  return res;
}
