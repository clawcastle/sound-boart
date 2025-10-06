import {
  ServerUsageMetrics,
  defaultUsageMetrics,
  SoundPlayedByUser,
} from "./usageMetrics.js";
import { soundboartConfig } from "../config.js";
import fs from "fs";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;
const readline = require("readline");

const userSoundHistoryHeader = '"userId","soundName","timestamp"\n';

interface UserSoundHistoryEntry {
  userId: string;
  soundName: string;
  timestamp: number;
}

export async function updateSoundPlayedMetrics(
  serverId: string,
  userId: string,
  soundName: string,
  isRandomSound: boolean
) {
  const directoryPath = Paths.usageMetricsDirectory(serverId);

  const directoryExists = await fileOrDirectoryExists(directoryPath);

  if (!directoryExists) {
    await fsAsync.mkdir(directoryPath, {
      recursive: true,
    });
  }

  const promises = [
    updateServerUsageMetrics(serverId, soundName),
    updateUserSoundHistory(serverId, userId, soundName, isRandomSound),
  ];

  await Promise.all(promises);
}

async function updateUserSoundHistory(
  serverId: string,
  userId: string,
  soundName: string,
  isRandomSound: boolean
) {
  const filePath = Paths.userSoundHistoryFile(serverId, userId);

  const fileExists = await fileOrDirectoryExists(filePath);
  if (!fileExists) {
    await fsAsync.writeFile(filePath, userSoundHistoryHeader);
  }

  const timestamp = Date.now();

  let soundNameString = soundName;
  if (isRandomSound) {
    soundNameString = `${soundName} (random)`;
  }

  const entry = {
    userId,
    soundName: soundNameString,
    timestamp,
  };

  const rowData = userSoundHistoryRow(entry);

  await fsAsync.appendFile(filePath, rowData);
}

export async function listUserSoundHistory(
  serverId: string,
  userId: string,
  nEntries: number
) {
  const filePath = Paths.userSoundHistoryFile(serverId, userId);

  const fileExists = await fileOrDirectoryExists(filePath);
  if (!fileExists) return [];

  const fileStream = fs.createReadStream(filePath);

  const readLineInterface = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const linesBuffer: string[] = [];

  for await (const line of readLineInterface) {
    if (linesBuffer.length >= nEntries) {
      linesBuffer.shift();
    }

    linesBuffer.push(line);
  }

  // Newest entry is at the bottom of the file, so we reverse the list to get the newest entry first.
  linesBuffer.reverse();

  const entries: UserSoundHistoryEntry[] = [];

  linesBuffer.forEach((line) => {
    const entry = parseUserSoundHistoryLine(line);

    if (!!entry) {
      entries.push(entry);
    } else {
      console.log("Failed to parse user sound history line: ", line);
    }
  });

  return entries;
}

async function updateServerUsageMetrics(serverId: string, soundName: string) {
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

  const filePath = Paths.usageMetricsFile(serverId);

  await fsAsync.writeFile(filePath, JSON.stringify(usageMetrics));
}

export async function getUsageMetricsForServer(serverId: string) {
  const filePath = `${soundboartConfig.usageMetricsDirectory}/${serverId}/metrics.json`;

  const fileExists = await fileOrDirectoryExists(filePath);

  if (!fileExists) return defaultUsageMetrics;
  const fileContent = await fsAsync.readFile(filePath, "utf-8");

  const usageMetrics = JSON.parse(fileContent) as ServerUsageMetrics;

  return usageMetrics ?? defaultUsageMetrics;
}

function userSoundHistoryRow(entry: UserSoundHistoryEntry): string {
  return `\"${entry.userId}\",\"${entry.soundName}\",\"${entry.timestamp}\"\n`;
}

function parseUserSoundHistoryLine(line: string): UserSoundHistoryEntry | null {
  const parts = line.split(",");

  if (parts.length < 3) return null;

  const [userId, soundName, timestampString] = parts;

  if (isNaN(Number(timestampString))) return null;

  const timestamp = Number(timestampString);

  return { userId, soundName, timestamp };
}
