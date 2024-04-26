import ICommandHandler from "./commandHandler.js";
import { getUsageMetricsForServer } from "../usageMetrics/usageMetricsManager.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { SoundPlayedByUser } from "../usageMetrics/usageMetrics.js";
import { Command } from "../command.js";

const topNSoundsDefault = 10;

type ListTopSoundsCommandHandlerArgs = {
  serverId: string;
  topNSounds: number;
};

class ListTopSoundsCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 0;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): ListTopSoundsCommandHandlerArgs | null {
    const { serverId, commandParts } = command.context;

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

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

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
