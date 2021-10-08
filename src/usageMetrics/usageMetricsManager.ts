import { ServerUsageMetrics, defaultUsageMetrics } from "./usageMetrics";
import { usageMetricsDirPath } from "../config";
import fs from "fs";
const fsAsync = fs.promises;

export async function updateSoundPlayedMetrics(
  serverId: string,
  userId: string,
  soundName: string
) {
  const filePath = `${usageMetricsDirPath}/${serverId}/metrics.json`;

  if (!fs.existsSync(filePath)) {
    await fsAsync.mkdir(filePath, {
      recursive: true,
    });
  }

  const usageMetrics = await getUsageMetricsForServer(serverId);
}

export async function getUsageMetricsForServer(serverId: string) {
  const filePath = `${usageMetricsDirPath}/${serverId}/metrics.json`;

  if (!fs.existsSync(filePath)) return defaultUsageMetrics;
  const fileContent = await fsAsync.readFile(filePath, "utf-8");

  const usageMetrics = JSON.parse(fileContent) as ServerUsageMetrics;

  return usageMetrics ?? defaultUsageMetrics;
}
