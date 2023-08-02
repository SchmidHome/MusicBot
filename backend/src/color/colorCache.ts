import { Cached, db, validateCollection } from "../mongodb";
import { Mutex } from "async-mutex";
import fetch from "node-fetch";
import Vibrant from "node-vibrant";
import z from "zod";

export const colorSchema = z.tuple([
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
]);
export type Color = z.infer<typeof colorSchema>;

const colorCache =
  db.collection<Cached<{ imageUri: string; color: [number, number, number] }>>(
    "colorCache"
  );
const colorCacheMutex = new Mutex();
validateCollection(colorCache, colorSchema);
export function clearColorCache() {
  return colorCache.deleteMany({});
}

export async function getColorFromSong(
  imageUri: string
): Promise<[number, number, number] | undefined> {
  const cache = await colorCache.findOne({ imageUri });
  if (cache) return cache.color;
  return colorCacheMutex.runExclusive(async () => {
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
  });
}
