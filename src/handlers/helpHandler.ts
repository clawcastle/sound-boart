import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { helpInfo } from "../utils/helpResults.js";
import { Command } from "../command.js";

type HelpCommandHandlerArgs = {
  specifiedCommand?: string;
};

class HelpCommandHandler implements ICommandHandler<Discord.Message> {
  activate(_: Command<Discord.Message>) {
    return true;
  }
  parseCommandPayload(
    command: Command<Discord.Message>
  ): HelpCommandHandlerArgs | null {
    if (command.context.commandParts.length === 0) return null;

    return command.context.commandParts.length > 1
      ? { specifiedCommand: command.context.commandParts[1] }
      : {};
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

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
