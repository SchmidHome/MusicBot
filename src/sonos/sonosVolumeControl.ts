import { SimpleCache } from "@idot-digital/simplecache"
import { SONOS_DEVICE_NAME } from "../config"
import { device, logger } from "./sonos"

const volumeCache = new SimpleCache(10000, async (_) => {
    logger.log("volumeCache update")
    const d = await device()
    return (await d.GroupRenderingControlService.GetGroupVolume({ InstanceID: 0 })).CurrentVolume
})

export async function getVolume(): Promise<number> {
    logger.log("getVolume()")
    return (await volumeCache.get(""))!
}

export async function setVolume(volume: number): Promise<boolean> {
    logger.log(`setVolume(${volume})`)
    // targetVolume = volume
    return await applyVolume(volume)
}

async function applyVolume(volume: number) {
    logger.log("applyVolume(" + volume + ")")
    const d = await device()
    let members = (await d.GetZoneGroupState()).find(v => v.coordinator.name == SONOS_DEVICE_NAME)?.members
    if (!members) return false
    const ret = (await Promise.all(members.map(async (member) => (await device(member.name, false)).SetVolume(volume)))).reduce((acc, v) => acc && v, true)
    volumeCache.remove("")
    return ret
}

setTimeout(getVolume, 1000)
// setInterval(applyVolume, 10000)
