import { SimpleCache } from "@idot-digital/simplecache";
import { SONOS_DEVICE_NAME } from "../lib/config";
import { device, logger } from "./sonos";
import { mutexRequest } from "../lib/mutexRequest";

const volumeCache = new SimpleCache(10000, async (_) => {
  logger.log("volumeCache update");
  const d = await device();
  return (
    await d.GroupRenderingControlService.GetGroupVolume({ InstanceID: 0 })
  ).CurrentVolume;
});

const getVolumeMutex = new mutexRequest(
  logger,
  "getVolume",
  1000 * 5,
  async () => {
    const d = await device();
    return (
      await d.GroupRenderingControlService.GetGroupVolume({ InstanceID: 0 })
    ).CurrentVolume;
  }
);
export const getVolume = getVolumeMutex.execute.bind(getVolumeMutex);

export async function setVolume(volume: number): Promise<boolean> {
  let start = Date.now();
  // targetVolume = volume
  let res = await applyVolume(volume);
  logger.log(`setVolume(${volume}): ${Date.now() - start}ms`);
  return res;
}

async function applyVolume(volume: number) {
  logger.log("applyVolume(" + volume + ")");
  const d = await device();
  let members = (await d.GetZoneGroupState()).find(
    (v) => v.coordinator.name == SONOS_DEVICE_NAME
  )?.members;
  if (!members) return false;
  const ret = (
    await Promise.all(
      members.map(async (member) =>
        (await device(member.name, false)).SetVolume(volume)
      )
    )
  ).reduce((acc, v) => acc && v, true);
  volumeCache.remove("");
  return ret;
}

// setTimeout(getVolume, 5000);
// setInterval(applyVolume, 10000)
