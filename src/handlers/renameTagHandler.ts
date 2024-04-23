import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import ServerSettings from "../serverSettings/serverSettings.js";
import { Command } from "../command.js";

type RenameTagCommandHandlerArgs = {
  serverId: string;
  currentTagName: string;
  newTagName: string;
};

class RenameTagCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 2;
  }
  parseCommandPayload(command: Command<Discord.Message>): RenameTagCommandHandlerArgs | null {
    const currentTagName = command.context.commandParts[1];
    const newTagName = command.context.commandParts[2];

    const serverId = command.payload.guild?.id;

    if (!serverId || !currentTagName || !newTagName) return null;

    return {
      serverId,
      currentTagName,
      newTagName,
    };
  }
  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to rename the tag.",
        textChannel
      );
      return;
    }

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings.tags[params.currentTagName]) {
      sendMessage(
        `No tag exists with name '${params.currentTagName}'.`,
        textChannel
      );
      return;
    }

    const { [params.currentTagName]: tagToRename, ...restTags } =
      serverSettings.tags;

    const updatedTags = { ...restTags, [params.newTagName]: tagToRename };
    const updatedSettings: ServerSettings = {
      ...serverSettings,
      tags: updatedTags,
    };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage(
      `Tag '${params.currentTagName}' successfully renamed to '${params.newTagName}'.`,
      textChannel
    );
  }
}

export default RenameTagCommandHandler;
