import fs from "fs";
import { soundboartConfig } from "../config.js";
const fsAsync = fs.promises;

export const fileOrDirectoryExists = async (
  filePath: string
): Promise<boolean> => {
  return await fsAsync
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
};

export class Paths {
  static soundFilesDirectory(serverId: string): string {
    return `${soundboartConfig.soundsDirectory}/${serverId}`;
  }

  static soundFile(serverId: string, soundName: string): string {
    return `${this.soundFilesDirectory(serverId)}/${soundName}.mp3`;
  }

  static serverSettingsDirectory(serverId: string): string {
    return `${soundboartConfig.serverSettingsDirectory}/${serverId}`;
  }

  static serverSettingsFile(serverId: string): string {
    return `${this.serverSettingsDirectory(serverId)}/settings.json`;
  }

  static usageMetricsDirectory(serverId: string): string {
    return `${soundboartConfig.usageMetricsDirectory}/${serverId}`;
  }

  static usageMetricsFile(serverId: string): string {
    return `${this.usageMetricsDirectory(serverId)}/metrics.json`;
  }
}
