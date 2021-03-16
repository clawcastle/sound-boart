import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import { listEvent } from "../soundBoartEvents";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings, updateSettings } from "../serverSettings/settingsManager";

type TagSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
  categoryName: string;
};

class TagSoundCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 2;
  }
  parseCommand(command: Discord.Message): TagSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    const serverId = command.guild?.id;

    if (!serverId || commandParts.length < 3) return null;

    const soundName = commandParts[1];
    const categoryName = commandParts[2];

    return {
      serverId,
      soundName,
      categoryName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

    if (!params) {
      sendMessage("Could not tag sound.", textChannel);
      return;
    }

    const soundExists = fs.existsSync(
      `${soundsDirPath}/${params.serverId}/${params.soundName}.mp3`
    );

    if (!soundExists) {
      sendMessage(
        `No sound exists with name ${params.soundName}.`,
        textChannel
      );
      return;
    }

    let serverSettings = await getSettings(params.serverId);

    if (!serverSettings.categories[params.categoryName]) {
      serverSettings = {
        ...serverSettings,
        categories: {
          ...serverSettings.categories,
          [params.categoryName]: [],
        },
      };
    }

    serverSettings.categories[params.categoryName].push(params.soundName);

    await updateSettings(params.serverId, serverSettings);

    sendMessage(
      `Successfully tagged sound ${params.soundName} with category ${params.categoryName}`,
      textChannel
    );
  }
}

export default TagSoundCommandHandler;
