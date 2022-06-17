import Discord from "discord.js";
import { leaveTimeoutInMilliseconds } from "../config.js";

const timerMap: { [channelId: string]: NodeJS.Timeout } = {};

export function resetVoiceChannelTimer(voiceChannel: Discord.VoiceChannel) {
  const channelId = voiceChannel.id;

  if (timerMap[channelId]) {
    clearTimeout(timerMap[channelId]);
  }

  const timerHandle = setTimeout(() => {
    voiceChannel.leave();
    delete timerMap[channelId];
  }, leaveTimeoutInMilliseconds);

  timerMap[channelId] = timerHandle;
}
