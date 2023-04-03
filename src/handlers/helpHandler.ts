import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { helpInfo } from "../utils/helpResults.js";
import { Command } from "../command.js";

type HelpCommandHandlerArgs = {
  specifiedCommand?: string;
};

class HelpCommandHandler implements ICommandHandler<Discord.Message> {
  activate(_: Discord.Message) {
    return true;
  }
  parseCommandPayload({
    content,
  }: Discord.Message): HelpCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);
    if (commandParts.length === 0) return null;

    return commandParts.length > 1 ? { specifiedCommand: commandParts[1] } : {};
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) return;

    if (!params.specifiedCommand) {
      let helpMessage = "";

      helpInfo.forEach((info) => {
        helpMessage += `${info.title}: ${info.description} \n\n`;
      });

      sendMessage(helpMessage, textChannel);
      return;
    }
  }
}

export default HelpCommandHandler;
