import { SonosDevice } from "@svrooij/sonos/lib";
import { PLAYING_OFFSET_MS } from "../lib/config";
import { device, logger, sonosToSpotifyUri } from "./sonos";
import { mutexRequest } from "../lib/mutexRequest";

function timeStringToSeconds(time: string): number {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

async function getState(d: SonosDevice) {
  const state = await d.AVTransportService.GetTransportInfo();
  return state.CurrentTransportState;
}
async function getPositionInfo(d: SonosDevice) {
  const info = await d.AVTransportService.GetPositionInfo();
  if (!info.TrackURI) return undefined;
  return {
    uri: sonosToSpotifyUri(info.TrackURI),
    track: info.Track - 1,
    secondsInTrack: timeStringToSeconds(info.RelTime),
    duration_s: timeStringToSeconds(info.TrackDuration),
  };
}

async function getQueue(d: SonosDevice) {
  const queue = await (await d.GetQueue()).Result;
  if (typeof queue === "string") {
    logger.warn(`getQueue() returned string: ${queue}`);
    return [];
  }
  return queue.map((track) => sonosToSpotifyUri(track.TrackUri!));
}

function removeFromQueue(d: SonosDevice, index: number) {
  return d.AVTransportService.RemoveTrackFromQueue({
    InstanceID: 0,
    ObjectID: `Q:0/${index + 1}`,
    UpdateID: 0,
  });
}

const getPlayingStateMutex = new mutexRequest(
  logger,
  "getPlayingState",
  async () => {
    const d = await device();
    return (await getState(d)) === "PLAYING";
  }
);
export const getPlayingState =
  getPlayingStateMutex.execute.bind(getPlayingStateMutex);

const getPlayingMutex = new mutexRequest(logger, "getPlaying", async () => {
  const d = await device();
  try {
    const s_now = Date.now();
    const info = await getPositionInfo(d);
    const queue = await getQueue(d);

    if (!info) return undefined;

    const offset = Number(PLAYING_OFFSET_MS) || 0;
    const now = {
      spotifyUri: info.uri,
      startDate: new Date(s_now - info.secondsInTrack * 1000 + offset),
      duration_s: info.duration_s,
    };
    let next = undefined;
    if (queue.length > info.track + 1) {
      next = {
        spotifyUri: queue[info.track + 1],
      };
      if (queue.length > info.track + 2) {
        // purge unwanted tracks
        try {
          for (let i = queue.length - 1; i > info.track + 1; i--)
            await removeFromQueue(d, i);
        } catch (error) {
          logger.error(`Error removing tracks from queue: ${error}`);
        }
      }
    }

    if (info.track == 0 && info.secondsInTrack < 5 && next) {
      // check if music is paused
      const playing = await getPlayingState();
      if (!playing) {
        logger.error("MUSIC PAUSE DETECTED, STARTING NEXT SONG");
        // start next song
        await d.AVTransportService.Next();
        await d.AVTransportService.Play({ InstanceID: 0, Speed: "1" });
      }
    }

    return { now, next };
  } catch (error) {
    return undefined;
  }
});
export const getPlaying = getPlayingMutex.execute.bind(getPlayingMutex);

export async function applyNextSpotifyUri(uri: string): Promise<void> {
  let start = Date.now();
  const d = await device();

  // try getting the info 3 times with 1 sec delay
  const info = await new Promise<
    | {
        uri: string;
        track: number;
        secondsInTrack: number;
        duration_s: number;
      }
    | undefined
  >((resolve, reject) => {
    let count = 0;
    const interval = setInterval(async () => {
      try {
        const info = await getPositionInfo(d);
        resolve(info);
      } catch (error) {
        count++;
        if (count > 3) {
          clearInterval(interval);
          resolve(undefined);
        }
      }
    }, 1000);
  });

  const queue = await getQueue(d);

  const end = info ? info.track : -1;
  try {
    for (let i = queue.length - 1; i > end; i--) await removeFromQueue(d, i);
  } catch (error) {
    logger.error(`Error removing tracks from queue: ${error}`);
  }

  // add new track
  logger.log(`applyNextSpotifyUri(${uri})...`);
  await d.AddUriToQueue(uri);
  logger.log(`applyNextSpotifyUri(${uri}): ${Date.now() - start}ms`);
}
