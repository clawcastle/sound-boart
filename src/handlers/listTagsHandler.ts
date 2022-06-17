import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSettings } from "../serverSettings/settingsManager.js";

type ListTagsCommandHandlerArgs = {
  serverId: string;
};

class ListTagsCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length >= 1;
  }
  parseCommand(command: Discord.Message): ListTagsCommandHandlerArgs | null {
    const serverId = command.guild?.id;

    if (!serverId) return null;

    return { serverId };
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
    const tagNames = Object.keys(serverSettings.tags).join("\n");

    if (tagNames && tagNames.length > 0) {
      sendMessage(tagNames, textChannel);
    }
  }
}

export default ListTagsCommandHandler;
