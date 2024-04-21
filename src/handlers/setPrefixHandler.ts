import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
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
  activate({ content }: Discord.Message<boolean>): boolean {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }

  parseCommandPayload({
    guild,
    content,
  }: Discord.Message<boolean>): SetPrefixCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);
    const prefix = commandParts[1];

    const serverId = guild?.id;

    if (!prefix || !serverId) return null;

    return {
      serverId,
      prefix,
    };
  }

  async handleCommand({
    payload,
  }: Command<Discord.Message<boolean>>): Promise<void> {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to set a custom prefix.",
        textChannel
      );
    }
  }
}
