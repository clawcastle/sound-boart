import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer";
import { playSound } from "../utils/soundHelpers";
import { soundBoartEventEmitter } from "../soundBoartEventEmitter";
import { soundPlayedEvent } from "../soundBoartEvents";

type PlaySoundCommandHandlerArgs = {
  serverId: string;
  soundNames: string[];
  userId: string;
};

class PlaySoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(_: Discord.Message) {
    return true;
  }

  parseCommand(command: Discord.Message): PlaySoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    if (commandParts.length === 0) return null;

    const soundNames = commandParts;

    const serverId = command.guild?.id;

    const userId = command.author.id;

    if (!serverId || !soundNames || !userId) return null;

    return {
      serverId,
      soundNames,
      userId,
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

    if (!params) return;

    if (params.soundNames.length > 3) {
      sendMessage(
        "Max amount of sounds played back-to-back is 3.",
        textChannel
      );
      return;
    }

    const voiceChannel = command.member?.voice?.channel;

    if (!voiceChannel) {
      sendMessage(
        "You need to be connected to a voice channel to play a sound.",
        textChannel
      );
      return;
    }

    const conn = await voiceChannel.join();

    for (const soundName of params.soundNames) {
      const soundFilePath = `${soundsDirPath}/${params.serverId}/${soundName}.mp3`;

      if (!fs.existsSync(soundFilePath)) {
        sendMessage(`Sound '${soundName}' does not exist.`, textChannel);
        continue;
      }

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
        continue;
      }
    }

    resetVoiceChannelTimer(voiceChannel);
  }
}

export default PlaySoundCommandHandler;
