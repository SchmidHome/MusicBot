import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ request }) {
  const headers = request.headers;
  const userAgent = headers.get('user-agent');
  if (userAgent){
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  const isMobile = toMatch.some((toMatchItem) =>
    userAgent.match(toMatchItem)
  );

  if (isMobile) redirect(307, '/dj');
}
}