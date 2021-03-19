import Discord from "discord.js";
import { leaveTimeoutInMilliseconds } from "../config";

const timerMap: { [serverId: string]: number } = {};

export function resetVoiceChannelTimer(voiceChannel: Discord.VoiceChannel) {
  const channelId = voiceChannel.id;

  if (timerMap[channelId]) {
    clearTimeout(timerMap[channelId]);
  }

  const timerHandle = setTimeout(() => {
    voiceChannel.leave();
    delete timerMap[channelId];
  }, leaveTimeoutInMilliseconds);
}
