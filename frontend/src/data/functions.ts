import { connectionError } from "./connectionError";

if (!import.meta.env.PUBLIC_SERVER_URL)
  throw new Error("No server URL provided");

if (!import.meta.env.DEV && import.meta.env.PUBLIC_MOCK_SERVER)
  console.warn("Mock server is enabled in a production build!");

export function getTimeStringFromMS(ms: number | undefined | null) {
  if (ms === undefined || ms === null) return "0:00";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  return `${hours ? `${hours}:` : ""}${
    hours ? minutes.toString().padStart(2, "0") : minutes
  }:${seconds.toString().padStart(2, "0")}`;
}

export async function customFetch<T>(
  route: string,
  {
    method,
    body,
    headers,
    ...rest
  }: Omit<RequestInit, "body"> & {
    method?: RequestInit["method"];
    body?: any;
    headers?: RequestInit["headers"];
  } = { method: "GET" }
): Promise<T> {
  try {
    const baseURL = import.meta.env.PUBLIC_SERVER_URL;
    const url = new URL(route, baseURL);
    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      ...rest,
    });

    if (res.status >= 500) throw new Error(await res.text());

    const data = await (() => {
      if (res.headers.get("Content-Type")?.includes("application/json"))
        return res.json();
      return res.text();
    })();

    connectionError.set(false);

    return data;
  } catch (e) {
    console.error("Error while fetching", e);
    connectionError.set(true);
    //@ts-ignore
    return null;
  }
}
