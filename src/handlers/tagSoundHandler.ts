import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import { Command } from "../command.js";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";

type TagSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
  tagName: string;
};

class TagSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 2;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): TagSoundCommandHandlerArgs | null {
    const { serverId, commandParts } = command.context;

    if (!serverId || commandParts.length < 3) return null;

    const soundName = commandParts[1];
    const tagName = commandParts[2];

    return {
      serverId,
      soundName,
      tagName,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage("Could not tag sound.", textChannel);
      return;
    }

    const soundExists = await fileOrDirectoryExists(
      Paths.soundFile(params.serverId, params.soundName)
    );

    if (!soundExists) {
      sendMessage(
        `No sound exists with name ${params.soundName}.`,
        textChannel
      );
      return;
    }

    let serverSettings = await getSettings(params.serverId);

    if (!serverSettings.tags[params.tagName]) {
      serverSettings = {
        ...serverSettings,
        tags: {
          ...serverSettings.tags,
          [params.tagName]: [],
        },
      };
    }

    serverSettings.tags[params.tagName].push(params.soundName);

    await updateSettings(params.serverId, serverSettings);

    sendMessage(
      `Successfully tagged sound ${params.soundName} with ${params.tagName}`,
      textChannel
    );
  }
}

export default TagSoundCommandHandler;
