import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type SearchCommandHandlerArgs = {
  serverId: string;
  query: string;
};

class SearchCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 1;
  }

  parseCommandPayload(command: Command<Discord.Message>) {
    const { serverId, commandParts } = command.context;

    if (commandParts.length < 2 || !serverId) return null;

    const query = commandParts[1];

    return { serverId, query };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

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
