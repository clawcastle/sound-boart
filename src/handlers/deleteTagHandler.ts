import ICommandHandler from "./commandHandler";
import * as Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings, updateSettings } from "../serverSettings/settingsManager";
import ServerSettings from "../serverSettings/serverSettings";

type DeleteTagCommandHandlerArgs = {
  serverId: string;
  tagName: string;
};

class DeleteTagCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 1;
  }
  parseCommand(command: Discord.Message): DeleteTagCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    const tagName = commandParts[1];

    const serverId = command.guild?.id;

    if (!tagName || !serverId) return null;

    return {
      serverId,
      tagName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to rename tag",
        textChannel
      );
      return;
    }

    const settings = await getSettings(params.serverId);

    if (!settings.tags[params.tagName]) {
      sendMessage(`No tag with name ${params.tagName} exists.`, textChannel);
      return;
    }

    const { [params.tagName]: tagToRemove, ...restTags } = settings.tags;

    const updatedSettings: ServerSettings = { ...settings, tags: restTags };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage("Tag deleted successfully.", textChannel);
  }
}

export default DeleteTagCommandHandler;
