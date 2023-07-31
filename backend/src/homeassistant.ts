import hass from "homeassistant-ws";
import type { HassApi } from "homeassistant-ws";
import {
  HOMEASSISTANT_HOST,
  HOMEASSISTANT_PORT,
  HOMEASSISTANT_TOKEN,
} from "./lib/config";
import { ConsoleLogger } from "./lib/logger";
import { getPlaying } from "./queue/getter";
import { getSong } from "./spotify/songCache";
import fetch from "node-fetch";

import Vibrant from "node-vibrant";

export const logger = new ConsoleLogger("hass");

async function getColorFromSong(
  imageUri: string
): Promise<[number, number, number] | undefined> {
  const image = await fetch(imageUri);
  const imageBuffer = await image.buffer();

  const vibrant = Vibrant.from(imageBuffer);
  const swatches = await vibrant.getSwatches();
  const mainColor = swatches.Vibrant;
  if (!mainColor) {
    logger.warn("no main color found");
    return;
  }
  return mainColor.rgb;
}

let ha: HassApi | undefined;
export default async function startHA() {
  try {
    logger.info("connecting to homeassistant");
    const _ha = await hass({
      host: HOMEASSISTANT_HOST,
      port: HOMEASSISTANT_PORT,
      token: HOMEASSISTANT_TOKEN,
    });

    logger.info("connected to homeassistant");
    ha = _ha;
  } catch (e) {
    logger.error("error while connecting to homeassistant");
    logger.error(e);
  }
}

export async function updateColor() {
  if (!ha) return logger.warn("no connection to homeassistant");
  let now = await getPlaying();
  if (!now) return;
  let song = await getSong(now.songUri);

  const color = await getColorFromSong(song.imageUri);
  logger.debug(`color for ${song.name}: ${color}`);

  const entityArr = [
    {
      id: "light.01_garderobe_rand_rgb",
      brightness: 150,
    },
    {
      id: "light.06_kuewo_rgb",
      brightness: 150,
    },
    {
      id: "light.07_andi_rgb",
      brightness: 150,
    },
    {
      id: "light.10_flur_balken_rgb",
      brightness: 150,
    },
    {
      id: "light.13_johannes_licht",
      brightness: 150,
    },
    {
      id: "light.11_gabriele_rgb",
      brightness: 150,
    },
    {
      id: "light.15_hwr_rgb",
      brightness: 150,
    },
  ];
  await Promise.all(
    entityArr.map(async (entity) => {
      if (!ha) return logger.warn("no connection to homeassistant");
      await ha.callService("light", "turn_on", {
        entity_id: entity.id,
        rgb_color: color,
        brightness: entity.brightness,
        transition: 5,
      });
    })
  );
}

setTimeout(updateColor, 1000 * 3);
setInterval(updateColor, 1000 * 20);
