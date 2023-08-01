import { SonosManager } from "@svrooij/sonos/lib";
import { ConsoleLogger } from "../lib/logger";
import { SONOS_DEVICE_IP, SONOS_DEVICE_NAME } from "../lib/config";
import chalk from "chalk";

export const logger = new ConsoleLogger("sonos", chalk.yellowBright);

const manager = new SonosManager();
manager.InitializeFromDevice(SONOS_DEVICE_IP).then(() => {
  manager.Devices.forEach((d) =>
    logger.log("Device %s (%s) is joined in %s", d.Name, d.Host, d.GroupName)
  );
});

async function getDevices() {
  // try manager.Devices 5 times with 1 second delay
  for (let i = 0; i < 5; i++) {
    try {
      return manager.Devices;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Could not get devices");
}

export async function device(name = SONOS_DEVICE_NAME, coordinator = true) {
  const d = (await getDevices()).find((d) => d.Name === name);
  for (let i = 0; i < 5; i++) {
    try {
      const d = manager.Devices.find((d) => d.Name === name);
      if (d) return coordinator ? d.Coordinator : d;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  if (!d) {
    throw new Error(`Device ${name} not found`);
  }
  return coordinator ? d.Coordinator : d;
}

export function sonosToSpotifyUri(uri: string): string {
  const res = /x-sonos-spotify:spotify:track:(\w{22})?.*/.exec(uri);
  if (res === null) throw new Error("Invalid Sonos URI: " + uri);
  const baseUri = res[1];
  return `spotify:track:${baseUri}`;
}
