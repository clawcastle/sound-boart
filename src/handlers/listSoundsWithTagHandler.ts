import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getSoundNamesWithTagForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type ListSoundsWithTagCommandHandlerArgs = {
  serverId: string;
  tagName: string;
};

class ListSoundsWithTagCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 1;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): ListSoundsWithTagCommandHandlerArgs | null {
    const tagName = command.context.commandParts[1];

    const serverId = command.context.serverId;

    if (!serverId || !tagName) return null;

    return {
      serverId,
      tagName,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list tags.",
        textChannel
      );
      return;
    }

    try {
      const soundNames = await getSoundNamesWithTagForServer(
        params.serverId,
        params.tagName
      );

      if (soundNames && soundNames.length > 0) {
        const soundNamesMessage = soundNames.join(", ");

        sendMessage(soundNamesMessage, textChannel);
      }
    } catch (error) {
      sendMessage(
        "Something went wrong while trying to list tags.",
        textChannel
      );
      return;
    }
  }
}

export default ListSoundsWithTagCommandHandler;
