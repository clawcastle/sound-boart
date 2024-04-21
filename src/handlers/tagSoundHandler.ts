import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundboartConfig } from "../config.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import { Command } from "../command.js";

type TagSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
  tagName: string;
};

class TagSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 2;
  }

  parseCommandPayload({
    content,
    guild,
  }: Discord.Message): TagSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);

    const serverId = guild?.id;

    if (!serverId || commandParts.length < 3) return null;

    const soundName = commandParts[1];
    const tagName = commandParts[2];

    return {
      serverId,
      soundName,
      tagName,
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage("Could not tag sound.", textChannel);
      return;
    }

    const soundExists = fs.existsSync(
      `${soundboartConfig.soundsDirectory}/${params.serverId}/${params.soundName}.mp3`
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
