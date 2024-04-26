export interface SoundboartConfig {
  botToken: string;
  soundsDirectory: string;
  serverSettingsDirectory: string;
  usageMetricsDirectory: string;
  defaultPrefix: string;
  leaveTimeoutSeconds: number;
  maxFileSizeInBytes: number;
}

const readOptionalEnvironmentVariable = (
  variableName: string
): string | undefined => {
  const value = process.env[variableName];

  return value;
};

const readOptionalEnvironmentVariableAs = <T>(
  variableName: string
): T | undefined => {
  const value = readOptionalEnvironmentVariable(variableName) as unknown as T;

  return value;
};

const readEnvironmentVariable = (variableName: string): string => {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(
      `Missing required environment variable: '${variableName}'.`
    );
  }

  return value;
};

const readEnvironmentVariableAs = <T>(variableName: string): T => {
  const value = readEnvironmentVariable(variableName) as unknown as T;

  if (!value) {
    throw new Error(
      `Failed to convert environment variable '${variableName}' to desired type.`
    );
  }

  return value;
};

const readSoundboartConfigFromEnv: () => SoundboartConfig = () => {
  const botToken = readEnvironmentVariable("BOT_TOKEN");
  const dataDirectory = readEnvironmentVariable("DATA_DIRECTORY");
  const defaultPrefix = readEnvironmentVariable("DEFAULT_PREFIX");

  const leaveTimeoutSeconds =
    readOptionalEnvironmentVariableAs<number>("LEAVE_TIMEOUT_SECONDS") ?? 300;
  const maxFileSizeInBytes =
    readOptionalEnvironmentVariableAs<number>("MAX_FILE_SIZE_IN_BYTES") ??
    5000000;

  return {
    botToken,
    defaultPrefix,
    leaveTimeoutSeconds,
    maxFileSizeInBytes,
    soundsDirectory: `${dataDirectory}/sounds`,
    serverSettingsDirectory: `${dataDirectory}/serverSettings`,
    usageMetricsDirectory: `${dataDirectory}/usageMetrics`,
  };
};

export const soundboartConfig = readSoundboartConfigFromEnv();
