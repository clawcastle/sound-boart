import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { soundsDirPath } from "../config.js";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { Command } from "../command.js";

const fsAsync = fs.promises;

type RenameSoundCommandHandlerArgs = {
  serverId: string;
  currentSoundName: string;
  newSoundName: string;
};

class RenameSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 2;
  }

  parseCommandPayload({
    content,
    guild,
  }: Discord.Message): RenameSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);

    const serverId = guild?.id;

    if (!serverId) return null;

    const currentSoundName = commandParts[1];
    const newSoundName = commandParts[2];

    return { serverId, currentSoundName, newSoundName };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);

    if (!params || params.currentSoundName === params.newSoundName) {
      sendMessage(
        "Could not rename sound.",
        payload.channel as Discord.TextChannel
      );
      return;
    }

    const currentSoundFilePath = `${soundsDirPath}/${params.serverId}/${params.currentSoundName}.mp3`;
    const newSoundFilePath = `${soundsDirPath}/${params.serverId}/${params.newSoundName}.mp3`;

    await fsAsync.rename(currentSoundFilePath, newSoundFilePath);

    sendMessage(
      "Sound renamed successfully.",
      payload.channel as Discord.TextChannel
    );
  }
}

export default RenameSoundCommandHandler;
