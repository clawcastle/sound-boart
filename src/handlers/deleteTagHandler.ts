import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
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
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 1;
  }
  parseCommandPayload(
    command: Command<Discord.Message>
  ): DeleteTagCommandHandlerArgs | null {
    const tagName = command.context.commandParts[1];

    if (!tagName) return null;

    return {
      serverId: command.context.serverId,
      tagName,
    };
  }
  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

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
