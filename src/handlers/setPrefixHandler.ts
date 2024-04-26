import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import { Command } from "../command.js";

type SetPrefixCommandHandlerArgs = {
  serverId: string;
  prefix: string;
};

class SetPrefixCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>): boolean {
    return command.context.commandParts.length > 1;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): SetPrefixCommandHandlerArgs | null {
    const { serverId, commandParts } = command.context;
    const prefix = commandParts[1];

    if (!prefix || !serverId) return null;

    return {
      serverId,
      prefix,
    };
  }

  async handleCommand(
    command: Command<Discord.Message<boolean>>
  ): Promise<void> {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to set a custom prefix.",
        textChannel
      );
      return;
    }

    const settings = await getSettings(params.serverId);

    const updatedSettings = {
      ...settings,
      prefix: params.prefix,
    };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage(`The prefix has been set to '${params.prefix}'.`, textChannel);
  }
}

export default SetPrefixCommandHandler;
