import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { Command } from "../command.js";
import { listUserSoundHistory } from "../usageMetrics/usageMetricsManager.js";

export class ListSoundHistoryHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Command<Discord.Message<boolean>>): boolean {
    return true;
  }

  parseCommandPayload(command: Command<Discord.Message<boolean>>) {
    const { serverId, commandParts } = command.context;

    const userId = command.payload.author.id;

    let nEntries = 10;

    if (commandParts.length > 1 && !isNaN(Number(commandParts[1]))) {
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

    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sound history",
        textChannel
      );
      return;
    }

    if (params.nEntries > 50) {
      sendMessage(
        "Cannot list more than 50 sound history entries",
        textChannel
      );
    }

    const historyEntries = await listUserSoundHistory(
      params.serverId,
      params.userId,
      params.nEntries
    );

    if (historyEntries.length === 0) {
      sendMessage("No sound history found.", textChannel);
      return;
    }

    const table = historyEntries
      .map((entry) => {
        const timestamp = new Date(entry.timestamp);
        const dateString = timestamp.toLocaleDateString("da-DK");

        return `${dateString} | ${entry.soundName}`;
      })
      .join("\n");

    const message = `History:\n\n${table}`;

    textChannel.send({
      embeds: [{ description: message }],
    });
  }
}
