import { customFetch } from "./functions";
import type { SongElement } from "../types";

export async function getSongs(search: string): Promise<SongElement[]> {
  console.log("requesting songs");
  const res = await customFetch<SongElement[] | "Unauthorized">("search", {
    body: {
      query: search,
      number: 10,
    },
    method: "POST",
  });
  if (res === "Unauthorized") {
    throw new Error("Unauthorized");
  }

  return res;
}
