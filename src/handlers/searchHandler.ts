import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";

type SearchCommandHandlerArgs = {
  serverId: string;
  query: string;
};

class SearchCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 1;
  }
  parseCommand(command: Discord.Message) {
    const serverId = command.guild?.id;
    const commandParts = getCommandParts(command.content);

    if (commandParts.length < 2 || !serverId) return null;

    const query = commandParts[1];

    return { serverId, query };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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
