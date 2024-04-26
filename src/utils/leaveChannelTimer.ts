import { soundboartConfig } from "../config.js";
import { getVoiceConnection } from "@discordjs/voice";

const timerMap: { [channelId: string]: NodeJS.Timeout } = {};

export function resetVoiceChannelTimer(serverId: string) {
  if (timerMap[serverId]) {
    clearTimeout(timerMap[serverId]);
  }

  const timerHandle = setTimeout(() => {
    const voiceConnection = getVoiceConnection(serverId);

    if (voiceConnection) {
      voiceConnection.destroy();
    }

    delete timerMap[serverId];
  }, soundboartConfig.leaveTimeoutSeconds * 1000);

  timerMap[serverId] = timerHandle;
}
