import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings } from "../serverSettings/settingsManager";
import { CommandHelpInfo, helpInfo } from "../utils/helpResults";

type HelpCommandHandlerArgs = {
  specifiedCommand?: string;
};

class HelpCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    return true;
  }
  parseCommand(command: Discord.Message): HelpCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    if (commandParts.length === 0) return null;

    return commandParts.length > 1 ? { specifiedCommand: commandParts[1] } : {};
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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
