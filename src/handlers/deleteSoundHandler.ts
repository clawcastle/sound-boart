import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundboartConfig } from "../config.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { Command } from "../command.js";
const fsAsync = fs.promises;

type DeleteSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
};

class DeleteSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 1;
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): DeleteSoundCommandHandlerArgs | null {
    const serverId = command.payload.guild?.id;
    const { commandParts } = command.context;

    if (commandParts.length < 1 || !serverId) return null;

    const soundName = commandParts[1];

    return {
      serverId,
      soundName,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    if (!params) return;

    const soundFilePath = `${soundboartConfig.soundsDirectory}/${params.serverId}/${params.soundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) {
      sendMessage(
        "Sound does not exist.",
        command.payload.channel as Discord.TextChannel
      );
      return;
    }

    await fsAsync.rm(soundFilePath);

    sendMessage(
      "Sound deleted successfully.",
      command.payload.channel as Discord.TextChannel
    );
  }
}

export default DeleteSoundCommandHandler;
