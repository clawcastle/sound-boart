import ServerSettings, { defaultSettings } from "./serverSettings.js";
import {
  getSettings as getSettingsFromCache,
  insertSettings as insertSettingsInCache,
} from "./serverSettingsCache.js";
import fs from "fs";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;

export async function getSettings(serverId: string): Promise<ServerSettings> {
  const cacheValue = getSettingsFromCache(serverId);
  if (cacheValue) return cacheValue;

  const filePath = Paths.serverSettingsFile(serverId);

  const fileExists = await fileOrDirectoryExists(filePath);

  if (!fileExists) return defaultSettings;
  const fileContent = await fsAsync.readFile(filePath, "utf-8");

  const settings = JSON.parse(fileContent) as ServerSettings;

  if (settings) {
    insertSettingsInCache(serverId, settings);
    return settings;
  }

  return defaultSettings;
}

export async function updateSettings(
  serverId: string,
  updatedSettings: ServerSettings
) {
  const filePath = Paths.serverSettingsFile(serverId);

  const fileExists = await fileOrDirectoryExists(filePath);

  if (!fileExists) {
    await fsAsync.mkdir(filePath, {
      recursive: true,
    });
  }

  await fsAsync.writeFile(filePath, JSON.stringify(updatedSettings));

  insertSettingsInCache(serverId, updatedSettings);
}
