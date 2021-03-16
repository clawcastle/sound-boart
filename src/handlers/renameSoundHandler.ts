import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";

type RenameSoundCommandHandlerArgs = {
  serverId: string;
  currentSoundName: string;
  newSoundName: string;
};

class RenameSoundCommandHandler implements ICommandHandler {
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

    if (!params) return;
  }
}

export default RenameSoundCommandHandler;
