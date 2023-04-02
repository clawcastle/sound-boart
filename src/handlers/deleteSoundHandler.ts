import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundsDirPath } from "../config.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { Command } from "../command.js";
const fsAsync = fs.promises;

type DeleteSoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
};

class DeleteSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }

  parseCommandPayload(
    payload: Discord.Message
  ): DeleteSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(payload.content);
    const serverId = payload.guild?.id;

    if (commandParts.length < 1 || !serverId) return null;

    const soundName = commandParts[1];

    return {
      serverId,
      soundName,
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    if (!params) return;

    const soundFilePath = `${soundsDirPath}/${params.serverId}/${params.soundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) {
      sendMessage(
        "Sound does not exist.",
        payload.channel as Discord.TextChannel
      );
      return;
    }

    await fsAsync.rm(soundFilePath);

    sendMessage(
      "Sound deleted successfully.",
      payload.channel as Discord.TextChannel
    );
  }
}

export default DeleteSoundCommandHandler;
