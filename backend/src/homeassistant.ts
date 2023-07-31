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
import { sameColor } from "./spotify/color";
import usedPlayer from "./player/usedPlayer";
export const logger = new ConsoleLogger("hass");

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

let running = false;
let lastColor: [number, number, number] | undefined = undefined;
let lastUpdate: number = 0;
export async function updateColor() {
  if (running) return logger.warn("updateColor already running");
  running = true;
  let start = Date.now();
  try {
    if (!ha) {
      logger.warn("no connection to homeassistant");
      running = false;
      return;
    }
    let now = await getPlaying();
    let isPaused = await usedPlayer.getPaused();
    if (!now) return (running = false);
    let song = await getSong(now.songUri);

    let color: [number, number, number] = isPaused
      ? [255, 255, 255]
      : song.color;

    if (sameColor(color, lastColor) && Date.now() - lastUpdate < 1000 * 60)
      return (running = false);
    lastColor = color;
    lastUpdate = Date.now();
    logger.log(`updating color to R${color[0]} G${color[1]} B${color[2]}`);

    await Promise.all(
      entityArr.map(async (entity) => {
        if (!ha) return logger.warn("no connection to homeassistant");
        // set random timeout
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000)
        );
        await ha.callService("light", "turn_on", {
          entity_id: entity.id,
          rgbw_color: [color[0], color[1], color[2], 0],
          transition: 5,
        });
      })
    );
  } catch (error) {}
  logger.log(`update(): ${Date.now() - start}ms`);
  running = false;
}

// setInterval(updateColor, 1000 * 3);

const entityArr = [
  // {
  //   id: "light.01_garderobe_rand_rgb",
  // },
  // {
  //   id: "light.06_kuewo_rgb",
  // },
  // {
  //   id: "light.07_andi_rgb",
  // },
  {
    id: "light.10_flur_balken_rgb",
  },
  {
    id: "light.13_johannes_licht",
  },
  // {
  //   id: "light.11_gabriele_rgb",
  // },
  // {
  //   id: "light.15_hwr_rgb",
  // },
];
