import Discord from "discord.js";
import fs from "fs";
const fsAsync = fs.promises;
import { soundsDirPath } from "../config";
import { getSettings } from "../serverSettings/settingsManager";

export function playSound(
  soundFilePath: string,
  voiceConnection: Discord.VoiceConnection
) {
  return new Promise<void>((resolve, reject) => {
    voiceConnection
      .play(soundFilePath)
      .on("finish", () => {
        resolve();
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}

export async function getSoundNamesForServer(serverId: string) {
  const soundsDirectory = `${soundsDirPath}/${serverId}`;
  if (!fs.existsSync(soundsDirectory)) {
    return [];
  }
  const soundNames = await fsAsync.readdir(soundsDirectory);

  return soundNames.map((name) => name.replace(".mp3", ""));
}

export async function getSoundNamesWithTagForServer(
  serverId: string,
  tagName: string
) {
  const serverSettings = await getSettings(serverId);

  if (!serverSettings.tags[tagName]) {
    return [];
  }

  const soundNames = serverSettings.tags[tagName];

  return soundNames;
}

export async function getClosestSoundNames(
  soundName: string,
  serverId: string,
  nClosest: number = 3
) {
  const soundNames = await getSoundNamesForServer(serverId);

  if (!soundNames || soundNames.length === 0) return [];

  const buckets: { [diff: number]: string[] } = {};

  const soundNameCharCounts: { [char: string]: number } = {};

  for (let i = 0; i < soundName.length; i++) {
    const char = soundName[i];

    if (!soundNameCharCounts[char]) {
      soundNameCharCounts[char] = 0;
    }

    soundNameCharCounts[char] += 1;
  }

  const otherSoundNameCharCounts: { [char: string]: number } = {};
  let previousCounts: { [char: string]: number } = {};

  const computeSoundNameDistance = (otherName: string) => {
    for (let i = 0; i < otherName.length; i++) {
      const char = otherName[i];

      if (!otherSoundNameCharCounts[char]) {
        otherSoundNameCharCounts[char] = 0;
      }

      otherSoundNameCharCounts[char] += 1;
    }

    let diff = 0;

    Object.keys(soundNameCharCounts).forEach((char) => {
      const currentCharCount = otherSoundNameCharCounts[char] ?? 0;
      const previousCharCount = previousCounts[char] ?? 0;

      const count = currentCharCount - previousCharCount;

      diff += Math.abs(soundNameCharCounts[char] - count);
    });

    previousCounts = { ...otherSoundNameCharCounts };

    return diff + Math.abs(soundName.length - otherName.length);
  };

  soundNames.forEach((otherName) => {
    const diff = computeSoundNameDistance(otherName);

    if (!buckets[diff]) {
      buckets[diff] = [];
    }

    buckets[diff].push(otherName);
  });

  const closestNames: string[] = [];

  Object.keys(buckets)
    .map((key) => Number.parseInt(key, 10))
    .sort((a, b) => a - b)
    .forEach((diff) => {
      for (let i = 0; i < buckets[diff].length; i++) {
        if (closestNames.length >= nClosest) return;

        closestNames.push(buckets[diff][i]);
      }
    });

  return closestNames;
}
