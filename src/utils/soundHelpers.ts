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
