import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import { soundsDirPath } from "../config.js";
import fs from "fs";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { playSound } from "../utils/soundHelpers.js";

type VoiceStateUpdate = {
  oldVoiceState: Discord.VoiceState;
  newVoiceState: Discord.VoiceState;
};

type PlayGreetingSoundCommandHandlerArgs = {
  userId: string;
  serverId: string;
  voiceChannel: Discord.VoiceBasedChannel;
};

class PlayGreetingSoundCommandHandler
  implements ICommandHandler<VoiceStateUpdate>
{
  activate({ oldVoiceState, newVoiceState }: VoiceStateUpdate) {
    return !oldVoiceState.channel && !!newVoiceState.channel;
  }
  parseCommand({
    newVoiceState,
  }: VoiceStateUpdate): PlayGreetingSoundCommandHandlerArgs | null {
    const serverId = newVoiceState.guild.id;
    const userId = newVoiceState.member?.id;
    const voiceChannel = newVoiceState.channel;

    if (!serverId || !userId || !voiceChannel) return null;

    return {
      userId,
      serverId,
      voiceChannel,
    };
  }
  async handleCommand(command: VoiceStateUpdate) {
    const params = this.parseCommand(command);

    if (!params) return;

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings || !serverSettings.greetings[params.userId]) return;

    const userGreetingSoundName = serverSettings.greetings[params.userId];
    const soundFilePath = `${soundsDirPath}/${params.serverId}/${userGreetingSoundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) return;

    const conn = joinVoiceChannel({
      channelId: params.voiceChannel.id,
      guildId: params.voiceChannel.guildId,
      adapterCreator: params.voiceChannel.guild.voiceAdapterCreator,
    });

    await playSound(soundFilePath, conn);
    resetVoiceChannelTimer(params.voiceChannel.guildId);
  }
}

export default PlayGreetingSoundCommandHandler;
