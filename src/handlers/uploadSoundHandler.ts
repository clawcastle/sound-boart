import Discord from "discord.js";
import fs from "fs";
import { soundsDirPath, prefix } from "../config";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler";
import { sendMessage } from "../utils/textChannelHelpers";
import { uploadEvent } from "../soundBoartEvents";
import { getCommandParts } from "../utils/messageHelpers";
const fsAsync = fs.promises;

type UploadSoundCommandHandlerParams = {
  discordCdnFilePath: string;
  serverId: string;
  soundName: string;
};

class UploadSoundCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return (
      commandParts.length > 1 &&
      uploadEvent.aliases.includes(commandParts[0]) &&
      Boolean(command.attachments)
    );
  }

  parseCommand(
    command: Discord.Message
  ): UploadSoundCommandHandlerParams | null {
    const commandParts = getCommandParts(command.content);
    const attachment = command.attachments.first();

    const soundName = commandParts[1];
    const serverId = command.guild?.id;

    if (!serverId || !attachment?.url) return null;

    return {
      discordCdnFilePath: attachment?.url,
      serverId: serverId,
      soundName: soundName,
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to upload your sound.",
        command.channel as Discord.TextChannel
      );
      return;
    }

    await this.uploadSound(
      params.soundName,
      params.serverId,
      params.discordCdnFilePath,
      command.channel as Discord.TextChannel
    );
  }

  private async uploadSound(
    soundName: string,
    serverId: string,
    discordCdnFilePath: string,
    textChannel: Discord.TextChannel
  ) {
    if (!fs.existsSync(soundsDirPath)) {
      await fsAsync.mkdir(soundsDirPath);
    }

    await this.downloadSoundFromDiscordAttachment(
      discordCdnFilePath,
      serverId,
      soundName,
      textChannel
    );
  }

  private async downloadSoundFromDiscordAttachment(
    discordCdnFilePath: string,
    serverId: string,
    soundName: string,
    textChannel: Discord.TextChannel
  ) {
    const writeStream = fs.createWriteStream(
      `${soundsDirPath}/${serverId}/${soundName}`
    );

    const response = await fetch(discordCdnFilePath);
    response.body.pipe(writeStream);
    writeStream
      .on("finish", () => {
        writeStream.close();
        sendMessage(
          `Sound uploaded succesfully. Type ${prefix}${soundName} to play it.`,
          textChannel
        );
      })
      .on("error", (err) => {
        console.log(err);
        sendMessage(
          "Something went wrong while trying to upload your sound.",
          textChannel
        );
      });
  }
}

export default UploadSoundCommandHandler;
