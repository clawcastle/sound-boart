export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  region: string;
}

export interface OpenAiConfig {
  apiKey: string;
}

export interface SoundboartConfig {
  botToken: string;
  soundsDirectory: string;
  serverSettingsDirectory: string;
  usageMetricsDirectory: string;
  transcriptionsDirectory: string;
  defaultPrefix: string;
  leaveTimeoutSeconds: number;
  maxFileSizeInBytes: number;
  s3Config?: S3Config;
  openAiConfig?: OpenAiConfig;
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

const readS3Config = (): S3Config | undefined => {
  const accessKeyId = readOptionalEnvironmentVariable("S3_ACCESS_KEY_ID");
  const secretAccessKey = readOptionalEnvironmentVariable(
    "S3_SECRET_ACCESS_KEY"
  );
  const endpoint = readOptionalEnvironmentVariable("S3_ENDPOINT");
  const bucketName = readOptionalEnvironmentVariable("S3_BUCKET_NAME");

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName)
    return undefined;

  const region = readOptionalEnvironmentVariable("S3_REGION") ?? "auto";

  return {
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    region,
  };
};

const readOpenAiConfig = (): OpenAiConfig | undefined => {
  const apiKey = readOptionalEnvironmentVariable("OPENAI_API_KEY");

  if (!apiKey) return undefined;

  return {
    apiKey,
  };
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

  const s3Config = readS3Config();
  const openAiConfig = readOpenAiConfig();

  return {
    botToken,
    defaultPrefix,
    leaveTimeoutSeconds,
    maxFileSizeInBytes,
    soundsDirectory: `${dataDirectory}/sounds`,
    serverSettingsDirectory: `${dataDirectory}/serverSettings`,
    usageMetricsDirectory: `${dataDirectory}/usageMetrics`,
    transcriptionsDirectory: `${dataDirectory}/transcriptions`,
    s3Config,
    openAiConfig,
  };
};

export const soundboartConfig = readSoundboartConfigFromEnv();
