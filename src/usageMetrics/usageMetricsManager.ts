import {
  ServerUsageMetrics,
  defaultUsageMetrics,
  SoundPlayedByUser,
} from "./usageMetrics.js";
import { soundboartConfig } from "../config.js";
import fs from "fs";
const fsAsync = fs.promises;

export async function updateSoundPlayedMetrics(
  serverId: string,
  userId: string,
  soundName: string
) {
  const directoryPath = `${soundboartConfig.usageMetricsDirectory}/${serverId}`;
  const filePath = `${directoryPath}/metrics.json`;

  if (!fs.existsSync(directoryPath)) {
    await fsAsync.mkdir(directoryPath, {
      recursive: true,
    });
  }

  const usageMetrics = await getUsageMetricsForServer(serverId);

  const entryToUpdate = usageMetrics.soundsPlayed.find(
    (s) => s.soundName === soundName
  );

  if (entryToUpdate) {
    entryToUpdate.timesPlayed += 1;
  } else {
    const newEntry: SoundPlayedByUser = { soundName, timesPlayed: 1 };
    usageMetrics.soundsPlayed.push(newEntry);
  }

  await fsAsync.writeFile(filePath, JSON.stringify(usageMetrics));
}

export async function getUsageMetricsForServer(serverId: string) {
  const filePath = `${soundboartConfig.usageMetricsDirectory}/${serverId}/metrics.json`;

  if (!fs.existsSync(filePath)) return defaultUsageMetrics;
  const fileContent = await fsAsync.readFile(filePath, "utf-8");

  const usageMetrics = JSON.parse(fileContent) as ServerUsageMetrics;

  return usageMetrics ?? defaultUsageMetrics;
}
