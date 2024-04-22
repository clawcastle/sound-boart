import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundboartConfig } from "../config.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer.js";
import { getClosestSoundNames, playSound } from "../utils/soundHelpers.js";
import { soundBoartEventEmitter } from "../soundBoartEventEmitter.js";
import { soundPlayedEvent } from "../soundBoartEvents.js";
import { Command } from "../command.js";
import { tracer } from "../tracing/tracer.js";

type PlaySoundCommandHandlerArgs = {
  serverId: string;
  soundNames: string[];
  userId: string;
};

class PlaySoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(_: Command<Discord.Message>) {
    return true;
  }

  parseCommandPayload(command: Command<Discord.Message>): PlaySoundCommandHandlerArgs | null {
    const {serverId, commandParts} = command.context;
    if (commandParts.length === 0) return null;

    const soundNames = command.context.commandParts;
    const {author} = command.payload;

    const userId = author.id;

    if (!serverId || !soundNames || !userId) return null;

    return {
      serverId,
      soundNames,
      userId,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) return;

    if (params.soundNames.length > 3) {
      sendMessage(
        "Max amount of sounds played back-to-back is 3.",
        textChannel
      );
      return;
    }

    command.span?.setAttribute("sound-names", params.soundNames);
    command.span?.setAttribute("user.id", params.userId);

    const voiceChannel = command.payload.member?.voice?.channel;

    if (!voiceChannel) {
      sendMessage(
        "You need to be connected to a voice channel to play a sound.",
        textChannel
      );
      return;
    }

    for (const soundName of params.soundNames) {
      const soundFilePath = `${soundboartConfig.soundsDirectory}/${params.serverId}/${soundName}.mp3`;

      if (!fs.existsSync(soundFilePath)) {
        const closestSoundNames = await getClosestSoundNames(
          soundName,
          params.serverId
        );

        let message = "Sound `" + soundName + "` does not exist.";

        if (closestSoundNames.length > 0) {
          const soundNamesFormatted = closestSoundNames
            .map((name) => "`" + name + "`")
            .join(", ");

          message += ` Did you mean: \n${soundNamesFormatted}`;
        }

        textChannel.send({
          embeds: [
            {
              description: message,
            },
          ],
        });
        continue;
      }

      try {
        await playSound(soundFilePath, voiceChannel);

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

    resetVoiceChannelTimer(voiceChannel.guildId);
  }
}

export default PlaySoundCommandHandler;
