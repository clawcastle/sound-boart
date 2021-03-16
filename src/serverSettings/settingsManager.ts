import ServerSettings, { defaultSettings } from "./serverSettings";
import {
  getSettings as getSettingsFromCache,
  insertSettings as insertSettingsInCache,
} from "./serverSettingsCache";
import fs from "fs";
import { serverSettingsDirPath } from "../config";
const fsAsync = fs.promises;

export async function getSettings(serverId: string): Promise<ServerSettings> {
  const cacheValue = getSettingsFromCache(serverId);
  if (cacheValue) return cacheValue;

  const filePath = `${serverSettingsDirPath}/${serverId}/settings.json`;

  if (!fs.existsSync(filePath)) return defaultSettings;
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
  const filePath = `${serverSettingsDirPath}/${serverId}`;

  if (!fs.existsSync(filePath)) {
    await fsAsync.mkdir(filePath, {
      recursive: true,
    });
  }

  await fsAsync.writeFile(
    `${filePath}/settings.json`,
    JSON.stringify(updatedSettings)
  );

  insertSettingsInCache(serverId, updatedSettings);
}
