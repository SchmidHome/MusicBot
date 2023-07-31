import fetch from "node-fetch";
import Vibrant from "node-vibrant";
import { ConsoleLogger } from "../lib/logger";

const logger = new ConsoleLogger("color");

let waiting = 0;
let allowedRequests = 0;
setInterval(() => {
  allowedRequests = 50;
}, 1000);

function canRequest(): boolean {
  if (allowedRequests > 0) {
    allowedRequests--;
    if (allowedRequests == 0)
      logger.warn(`reached rate limit, ${waiting} requests waiting`);
    return true;
  }
  return false;
}

async function awaitRequest(): Promise<void> {
  while (!canRequest()) {
    waiting++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    waiting--;
  }
}

export async function getColorFromSong(
  imageUri: string
): Promise<[number, number, number] | undefined> {
  awaitRequest();
  const image = await fetch(imageUri);
  const imageBuffer = await image.buffer();

  const vibrant = Vibrant.from(imageBuffer);
  const swatches = await vibrant.getSwatches();
  const mainColor = swatches.Vibrant;
  if (!mainColor) return;

  //@ts-ignore
  const rounded: [number, number, number] = mainColor.rgb.map((c) =>
    Math.round(c)
  );
  //   logger.log(`${name}: ${mainColor.rgb.map((c) => Math.round(c))}`);
  return rounded;
}

export function sameColor(
  color1: [number, number, number] | undefined,
  color2: [number, number, number] | undefined
): boolean {
  if (!color1 || !color2) return false;
  return (
    color1[0] == color2[0] && color1[1] == color2[1] && color1[2] == color2[2]
  );
}
