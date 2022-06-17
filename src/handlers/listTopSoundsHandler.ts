import ICommandHandler from "./commandHandler.js";
import { getUsageMetricsForServer } from "../usageMetrics/usageMetricsManager.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { SoundPlayedByUser } from "../usageMetrics/usageMetrics.js";

const topNSoundsDefault = 10;

type ListTopSoundsCommandHandlerArgs = {
  serverId: string;
  topNSounds: number;
};

class ListTopSoundsCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 0;
  }
  parseCommand(
    command: Discord.Message
  ): ListTopSoundsCommandHandlerArgs | null {
    const serverId = command.guild?.id;

    const commandParts = getCommandParts(command.content);

    let topNSounds = topNSoundsDefault;

    if (commandParts.length > 1 && !isNaN(Number(commandParts[1]))) {
      topNSounds = Number(commandParts[1]);
    }

    if (!serverId) return null;

    return {
      serverId,
      topNSounds,
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list usage metrics",
        textChannel
      );
      return;
    }

    const serverUsageMetrics = await getUsageMetricsForServer(params.serverId);

    const soundsSortedByTimesPlayed = serverUsageMetrics.soundsPlayed
      .filter((sound) => sound.timesPlayed !== 0)
      .sort((a, b) => b.timesPlayed - a.timesPlayed)
      .slice(0, params.topNSounds);

    const messageChunks = this.createSoundsPlayedMessageChunked(
      soundsSortedByTimesPlayed
    );

    messageChunks.forEach((messageChunk) => {
      sendMessage(messageChunk, textChannel);
    });
  }

  createSoundsPlayedMessageChunked(
    soundsPlayed: SoundPlayedByUser[]
  ): string[] {
    if (soundsPlayed.length === 0) {
      return [
        "No metrics available yet. Try playing some sounds and you should be able to see them!",
      ];
    }

    const allSoundsToList = soundsPlayed.reduce(
      (a, b) => a + `"${b.soundName}": ${b.timesPlayed} \r\n`,
      ""
    );

    const chunks = [];
    let currentChunk = "";

    for (const soundPlayed of allSoundsToList) {
      if (currentChunk.length + soundPlayed.length >= 2000) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += soundPlayed;
    }

    chunks.push(currentChunk);

    return chunks;
  }
}

export default ListTopSoundsCommandHandler;
