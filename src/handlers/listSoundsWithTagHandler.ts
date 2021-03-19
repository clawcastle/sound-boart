import ICommandHandler from "./commandHandler";
import * as Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings } from "../serverSettings/settingsManager";

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

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings.tags[params.tagName]) {
      sendMessage(
        `No tag exists with the name '${params.tagName}'.`,
        textChannel
      );
      return;
    }

    const soundNames = serverSettings.tags[params.tagName].join(", ");

    if (soundNames) {
      sendMessage(soundNames, textChannel);
    }
  }
}

export default ListSoundsWithTagCommandHandler;
