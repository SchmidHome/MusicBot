import type { User } from "../types";
import { customFetch } from "./functions";

export async function getUser(): Promise<User> {
  const res = await customFetch<User>("user", {
    method: "GET",
  });

  return res;
}
