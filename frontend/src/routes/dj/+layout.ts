import { getUser } from "$data/getUser.js";

export const prerender = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  return await getUser();
}
