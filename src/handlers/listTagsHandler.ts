import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import { Command } from "../command.js";

type ListTagsCommandHandlerArgs = {
  serverId: string;
};

class ListTagsCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length >= 1;
  }
  parseCommandPayload({
    guild,
  }: Discord.Message): ListTagsCommandHandlerArgs | null {
    const serverId = guild?.id;

    if (!serverId) return null;

    return { serverId };
  }
  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

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
