import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import ServerSettings from "../serverSettings/serverSettings.js";
import { Command } from "../command.js";

type DeleteTagCommandHandlerArgs = {
  serverId: string;
  tagName: string;
};

class DeleteTagCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }
  parseCommandPayload(
    payload: Discord.Message
  ): DeleteTagCommandHandlerArgs | null {
    const commandParts = getCommandParts(payload.content);
    const tagName = commandParts[1];

    const serverId = payload.guild?.id;

    if (!tagName || !serverId) return null;

    return {
      serverId,
      tagName,
    };
  }
  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

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
