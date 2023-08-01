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
import {
  HSLtoRGB,
  RGBtoHSL,
  rangeColor,
  roundColor,
  scaleColor,
} from "./color";
import chalk from "chalk";
export const logger = new ConsoleLogger("hass", chalk.blueBright);

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
let firstPause = true;
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
    if (firstPause && isPaused) {
      firstPause = false;
      isPaused = false;
    } else if (!isPaused) {
      firstPause = true;
    }
    if (!now) return (running = false);
    let song = await getSong(now.songUri);

    let color: [number, number, number] = song.color;

    // make colors more vib
    let hsl = RGBtoHSL(color);
    let hsl2 = { ...hsl };
    // maximize saturation
    hsl2.sat = Math.min(hsl.sat + 20, 100);
    hsl2.lum = 50;
    let colorSaturated = roundColor(scaleColor(rangeColor(HSLtoRGB(hsl2))));
    if (isPaused) {
      color = [255, 200, 100];
      colorSaturated = [255, 200, 100];
    }

    if (sameColor(color, lastColor) && Date.now() - lastUpdate < 1000 * 60)
      return (running = false);
    logger.log(
      `color: R${color[0]} G${color[1]} B${color[2]} -> H${hsl.hue} S${hsl.sat} L${hsl.lum} -> R${colorSaturated[0]} G${colorSaturated[1]} B${colorSaturated[2]}`
    );
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
        let _color = colorSaturated;
        if (entity.id === "light.06_esswo_rgb") _color = color;
        await ha.callService("light", "turn_on", {
          entity_id: entity.id,
          rgbw_color: [_color[0], _color[1], _color[2], 0],
          transition: 5,
        });
      })
    );
  } catch (error) {}
  logger.log(`update(): ${Date.now() - start}ms`);
  running = false;
}

setInterval(updateColor, 1000 * 5);

const entityArr = [
  {
    id: "light.01_garderobe_rand_rgb",
  },
  // {
  //   id: "light.06_kuewo_rgb",
  // },
  {
    id: "light.06_esswo_rgb",
  },
  {
    id: "light.06_kuess_rgb",
  },
  // {
  //   id: "light.07_andi_rgb",
  // },
  {
    id: "light.10_flur_balken_rgb",
  },
  {
    id: "light.13_johannes_licht",
  },
  {
    id: "light.11_gabriele_rgb",
  },
  {
    id: "light.15_hwr_rgb",
  },
];
