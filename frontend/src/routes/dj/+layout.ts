import { getUser } from "$data/getUser.js";

export const prerender = false;
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  return await getUser();
}
