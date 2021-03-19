import ICommandHandler from "./commandHandler";
import * as Discord from "discord.js";
import { soundsDirPath } from "../config";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
const fsAsync = fs.promises;

type DeleteSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
};

class DeleteSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    return true;
  }

  parseCommand(command: Discord.Message): DeleteSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    const serverId = command.guild?.id;

    if (commandParts.length === 0 || !serverId) return null;

    const soundName = commandParts[1];

    return {
      serverId,
      soundName,
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    if (!params) return;

    const soundFilePath = `${soundsDirPath}/${params.serverId}/${params.soundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) {
      sendMessage(
        "Sound does not exist.",
        command.channel as Discord.TextChannel
      );
      return;
    }

    await fsAsync.rm(soundFilePath);

    sendMessage(
      "Sound deleted successfully.",
      command.channel as Discord.TextChannel
    );
  }
}

export default DeleteSoundCommandHandler;
