import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSoundNamesWithTagForServer } from "../utils/soundHelpers";

type ListSoundsWithTagCommandHandlerArgs = {
  serverId: string;
  tagName: string;
};

class ListSoundsWithTagCommandHandler
  implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 1;
  }
  parseCommand(
    command: Discord.Message
  ): ListSoundsWithTagCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    const tagName = commandParts[1];

    const serverId = command.guild?.id;

    if (!serverId || !tagName) return null;

    return {
      serverId,
      tagName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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
