import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings, updateSettings } from "../serverSettings/settingsManager";
import ServerSettings from "../serverSettings/serverSettings";

type RenameTagCommandHandlerArgs = {
  serverId: string;
  currentTagName: string;
  newTagName: string;
};

class RenameTagCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 2;
  }
  parseCommand(command: Discord.Message): RenameTagCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    const currentTagName = commandParts[1];
    const newTagName = commandParts[2];

    const serverId = command.guild?.id;

    if (!serverId || !currentTagName || !newTagName) return null;

    return {
      serverId,
      currentTagName,
      newTagName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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

    const {
      [params.currentTagName]: tagToRename,
      ...restTags
    } = serverSettings.tags;

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
