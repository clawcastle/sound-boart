import fs from "fs";

export interface SoundboartConfig {
  botToken: string;
  soundsDirectory: string;
  serverSettingsDirectory: string;
  usageMetricsDirectory: string;
  defaultPrefix: string;
  leaveTimeoutMilliseconds: number;
  maxFileSizeInBytes: number;
}

const readSoundboartConfig: () => SoundboartConfig = () => {
  const configFileContent = fs.readFileSync(
    "./soundboart-config.json",
    "utf-8"
  );

  const configJson = JSON.parse(configFileContent) as SoundboartConfig;

  if (!configJson) {
    throw new Error(
      `Failed to parse soundboart config from json: '${configFileContent}'.`
    );
  }

  return configJson;
};

export const soundboartConfig = readSoundboartConfig();
