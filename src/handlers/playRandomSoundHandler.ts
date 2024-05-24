import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundboartConfig } from "../config.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import {
  playSound,
  getSoundNamesForServer,
  getSoundNamesWithTagForServer,
} from "../utils/soundHelpers.js";
import { soundBoartEventEmitter } from "../soundBoartEventEmitter.js";
import { soundPlayedEvent } from "../soundBoartEvents.js";
import { Command } from "../command.js";
import { Paths } from "../utils/fsHelpers.js";

type PlayRandomSoundCommandHandlerArgs = {
  serverId: string;
  tagName?: string;
  userId: string;
};

class PlayRandomSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 0;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): PlayRandomSoundCommandHandlerArgs | null {
    const { serverId, commandParts } = command.context;

    const userId = command.payload.author.id;

    if (!serverId || !userId || commandParts.length === 0) return null;

    if (commandParts.length === 1) return { serverId, userId };

    const tagName = commandParts[1];

    return {
      serverId,
      userId,
      tagName,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;
    const voiceChannel = command.payload.member?.voice?.channel;

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

    command.span?.setAttribute("sound-name", soundName);
    command.span?.setAttribute("user.id", params.userId);

    const soundFilePath = Paths.soundFile(params.serverId, soundName);

    try {
      await playSound(soundFilePath, voiceChannel);

      if (soundPlayedEvent.aliases?.length > 0) {
        const soundPlayedCommand = new Command(
          {
            soundName,
            serverId: params.serverId,
            userId: params.userId,
          },
          command.context
        );

        soundBoartEventEmitter.emit(
          soundPlayedEvent.aliases[0],
          soundPlayedCommand
        );
      }
    } catch (err) {
      sendMessage(
        `Something went wrong while playing sound '${soundName}'`,
        textChannel
      );
    }

    resetVoiceChannelTimer(voiceChannel.guildId);
  }
}

export default PlayRandomSoundCommandHandler;
