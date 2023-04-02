import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import { soundsDirPath } from "../config.js";
import fs from "fs";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import { playSound } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

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

  parseCommandPayload({
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

  async handleCommand({ payload }: Command<VoiceStateUpdate>) {
    const params = this.parseCommandPayload(payload);

    if (!params) return;

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings || !serverSettings.greetings[params.userId]) return;

    const userGreetingSoundName = serverSettings.greetings[params.userId];
    const soundFilePath = `${soundsDirPath}/${params.serverId}/${userGreetingSoundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) return;

    await playSound(soundFilePath, params.voiceChannel);
    resetVoiceChannelTimer(params.voiceChannel.guildId);
  }
}

export default PlayGreetingSoundCommandHandler;
