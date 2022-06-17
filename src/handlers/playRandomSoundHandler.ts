import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundsDirPath } from "../config.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import {
  playSound,
  getSoundNamesForServer,
  getSoundNamesWithTagForServer,
} from "../utils/soundHelpers.js";
import { soundBoartEventEmitter } from "../soundBoartEventEmitter.js";
import { soundPlayedEvent } from "../soundBoartEvents.js";

type PlayRandomSoundCommandHandlerArgs = {
  serverId: string;
  tagName?: string;
  userId: string;
};

class PlayRandomSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 0;
  }
  parseCommand(
    command: Discord.Message
  ): PlayRandomSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    const serverId = command.guild?.id;
    const userId = command.author.id;

    if (!serverId || !userId || commandParts.length === 0) return null;

    if (commandParts.length === 1) return { serverId, userId };

    const tagName = commandParts[1];

    return {
      serverId,
      userId,
      tagName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;
    const voiceChannel = command.member?.voice?.channel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to play a random sound",
        textChannel
      );
      return;
    }

    if (!voiceChannel) {
      sendMessage(
        "You need to be connected to a voice channel to play a sound.",
        textChannel
      );
      return;
    }

    const soundNames = params.tagName
      ? await getSoundNamesWithTagForServer(params.serverId, params.tagName)
      : await getSoundNamesForServer(params.serverId);

    if (!soundNames || soundNames.length === 0) {
      sendMessage(
        "Either no sounds exist on the server, or no sounds exist with the provided tag.",
        textChannel
      );
      return;
    }

    const index = Math.ceil(Math.random() * soundNames.length - 1);
    const soundName = soundNames[index];

    const conn = await voiceChannel.join();

    const soundFilePath = `${soundsDirPath}/${params.serverId}/${soundName}.mp3`;

    try {
      await playSound(soundFilePath, conn);

      if (soundPlayedEvent.aliases?.length > 0) {
        soundBoartEventEmitter.emit(soundPlayedEvent.aliases[0], {
          soundName,
          serverId: params.serverId,
          userId: params.userId,
        });
      }
    } catch (err) {
      sendMessage(
        `Something went wrong while playing sound '${soundName}'`,
        textChannel
      );
    }

    resetVoiceChannelTimer(voiceChannel);
  }
}

export default PlayRandomSoundCommandHandler;
