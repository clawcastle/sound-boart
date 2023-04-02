import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type SearchCommandHandlerArgs = {
  serverId: string;
  query: string;
};

class SearchCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }

  parseCommandPayload({ content, guild }: Discord.Message) {
    const serverId = guild?.id;
    const commandParts = getCommandParts(content);

    if (commandParts.length < 2 || !serverId) return null;

    const query = commandParts[1];

    return { serverId, query };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while searching for sound.",
        textChannel
      );
      return;
    }

    const soundNames = await getSoundNamesForServer(params.serverId);

    const searchResults = soundNames.filter((soundName) =>
      soundName.includes(params.query)
    );

    if (!searchResults || searchResults.length === 0) {
      sendMessage("No sounds matched your search.", textChannel);
      return;
    }

    const searchResultMessage = searchResults.join(", ");

    sendMessage(searchResultMessage, textChannel);
  }
}

export default SearchCommandHandler;
