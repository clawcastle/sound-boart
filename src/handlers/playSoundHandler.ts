import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import { listEvent } from "../soundBoartEvents";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";

type PlaySoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
};

class PlaySoundCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    return true;
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params) return;

    if (
      !fs.existsSync(`${soundsDirPath}/${params.serverId}/${params.soundName}`)
    ) {
      sendMessage(
        "Sound does not exist.",
        command.channel as Discord.TextChannel
      );
    }
  }

  parseCommand(command: Discord.Message): PlaySoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    if (commandParts.length === 0 || !command.guild?.id) return null;

    return {
      serverId: command.guild.id,
      soundName: commandParts[0],
    };
  }
}
