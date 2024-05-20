import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import { soundboartConfig } from "../config.js";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import { playSound } from "../utils/soundHelpers.js";
import { Command } from "../command.js";
import { fileOrDirectoryExists } from "../utils/fsHelpers.js";

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
  activate(command: Command<VoiceStateUpdate>) {
    const { oldVoiceState, newVoiceState } = command.payload;

    return !oldVoiceState.channel && !!newVoiceState.channel;
  }

  parseCommandPayload(
    command: Command<VoiceStateUpdate>
  ): PlayGreetingSoundCommandHandlerArgs | null {
    const { newVoiceState } = command.payload;

    const serverId = command.context.serverId;
    const userId = newVoiceState.member?.id;
    const voiceChannel = newVoiceState.channel;

    if (!serverId || !userId || !voiceChannel) return null;

    return {
      userId,
      serverId,
      voiceChannel,
    };
  }

  async handleCommand(command: Command<VoiceStateUpdate>) {
    const params = this.parseCommandPayload(command);

    if (!params) return;

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings || !serverSettings.greetings[params.userId]) return;

    const userGreetingSoundName = serverSettings.greetings[params.userId];
    const soundFilePath = `${soundboartConfig.soundsDirectory}/${params.serverId}/${userGreetingSoundName}.mp3`;

    const soundExists = await fileOrDirectoryExists(soundFilePath);
    if (!soundExists) return;

    await playSound(soundFilePath, params.voiceChannel);
    resetVoiceChannelTimer(params.voiceChannel.guildId);
  }
}

export default PlayGreetingSoundCommandHandler;
