import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import { listEvent } from "../soundBoartEvents";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";

const fsAsync = fs.promises;

type ListSoundsCommandHandlerParams = {
  serverId: string;
  query?: string;
};

class ListSoundsCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return (
      commandParts.length > 1 && listEvent.aliases.includes(commandParts[1])
    );
  }

  parseCommand(
    command: Discord.Message
  ): ListSoundsCommandHandlerParams | null {
    const commandParts = getCommandParts(command.content);
    const serverId = command.guild?.id;

    if (!serverId) return null;

    return {
      serverId,
      ...(commandParts.length > 1 && { query: commandParts[1] }),
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sounds",
        command.channel as Discord.TextChannel
      );
      return;
    }

    if (!params.query) {
      const soundNames = await this.getSoundNames(params.serverId);
      const messages = this.chunkMessage(soundNames);

      const textChannel = command.channel as Discord.TextChannel;
      messages.forEach((msg) => {
        textChannel.send(msg);
      });
    } else {
      //Handle list category/other stuff
    }
  }

  private async getSoundNames(serverId: string) {
    const soundNames = await fsAsync.readdir(`${soundsDirPath}/${serverId}`);

    return soundNames;
  }

  private chunkMessage(soundNames: string[]) {
    const allSounds = soundNames.reduce((a, b) => a + `, ${b}`);

    return allSounds.match(/.{1,2000}/g) ?? [];
  }
}

export default ListSoundsCommandHandler;