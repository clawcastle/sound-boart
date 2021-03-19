import ICommandHandler from "./commandHandler";
import * as Discord from "discord.js";
import { soundsDirPath } from "../config";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
const fsAsync = fs.promises;

type RenameSoundCommandHandlerArgs = {
  serverId: string;
  currentSoundName: string;
  newSoundName: string;
};

class RenameSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 2;
  }
  parseCommand(command: Discord.Message): RenameSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    const serverId = command.guild?.id;

    if (!serverId) return null;

    const currentSoundName = commandParts[1];
    const newSoundName = commandParts[2];

    return { serverId, currentSoundName, newSoundName };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params || params.currentSoundName === params.newSoundName) {
      sendMessage(
        "Could not rename sound.",
        command.channel as Discord.TextChannel
      );
      return;
    }

    const currentSoundFilePath = `${soundsDirPath}/${params.serverId}/${params.currentSoundName}.mp3`;
    const newSoundFilePath = `${soundsDirPath}/${params.serverId}/${params.newSoundName}.mp3`;

    await fsAsync.rename(currentSoundFilePath, newSoundFilePath);

    sendMessage(
      "Sound renamed successfully.",
      command.channel as Discord.TextChannel
    );
  }
}

export default RenameSoundCommandHandler;
