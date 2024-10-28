import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { Command } from "../command.js";
import { Paths } from "../utils/fsHelpers.js";

const fsAsync = fs.promises;

type RenameSoundCommandHandlerArgs = {
  serverId: string;
  currentSoundName: string;
  newSoundName: string;
};

class RenameSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 2;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): RenameSoundCommandHandlerArgs | null {
    const commandParts = command.context.commandParts;

    const serverId = command.payload.guild?.id;

    if (!serverId) return null;

    const currentSoundName = commandParts[1];
    const newSoundName = commandParts[2];

    return { serverId, currentSoundName, newSoundName };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);

    if (!params || params.currentSoundName === params.newSoundName) {
      sendMessage(
        "Could not rename sound.",
        command.payload.channel as Discord.TextChannel
      );
      return;
    }

    const currentSoundFilePath = Paths.soundFile(
      params.serverId,
      params.currentSoundName
    );
    const newSoundFilePath = Paths.soundFile(
      params.serverId,
      params.newSoundName
    );

    await fsAsync.rename(currentSoundFilePath, newSoundFilePath);

    sendMessage(
      "Sound renamed successfully.",
      command.payload.channel as Discord.TextChannel
    );
  }
}

export default RenameSoundCommandHandler;
