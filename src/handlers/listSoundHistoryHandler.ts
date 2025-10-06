import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { Command } from "../command.js";
import { listUserSoundHistory } from "../usageMetrics/usageMetricsManager.js";

class ListSoundHistoryHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message<boolean>>): boolean {
    return true;
  }

  parseCommandPayload(command: Command<Discord.Message<boolean>>) {
    const { serverId, commandParts } = command.context;

    const userId = command.payload.author.id;

    if (commandParts.length < 2 || !serverId) return null;

    let nEntries = 10;

    if (!isNaN(Number(commandParts[1]))) {
      nEntries = Number(commandParts[1]);
    }

    return {
      serverId,
      userId,
      nEntries,
    };
  }

  async handleCommand(
    command: Command<Discord.Message<boolean>>
  ): Promise<void> {
    const params = this.parseCommandPayload(command);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sound history",
        command.payload.channel as Discord.TextChannel
      );
      return;
    }

    const historyEntries = await listUserSoundHistory(
      params.serverId,
      params.userId,
      params.nEntries
    );

    const message = historyEntries
      .map((entry) => {
        const timestamp = new Date(entry.timestamp);
        const dateString = timestamp.toLocaleDateString("da-DK");

        return `${dateString} | ${entry.soundName}`;
      })
      .join("\n");

    const textChannel = command.payload.channel as Discord.TextChannel;

    textChannel.send(message);
  }
}
