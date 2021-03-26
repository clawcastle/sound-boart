import Discord from "discord.js";
import fs from "fs";
import { soundsDirPath, prefix, maxFileSizeInBytes } from "../config";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler";
import { sendMessage } from "../utils/textChannelHelpers";
import { uploadEvent, events } from "../soundBoartEvents";
import { getCommandParts } from "../utils/messageHelpers";
const fsAsync = fs.promises;

type UploadSoundCommandHandlerParams = {
  discordCdnFilePath: string;
  serverId: string;
  soundName: string;
  size: number;
};

class UploadSoundCommandHandler implements ICommandHandler<Discord.Message> {
  private _reservedWords: string[] = [];
  constructor() {
    events.forEach((event) => {
      event.aliases.forEach((alias) => {
        this._reservedWords.push(alias);
      });
    });
  }

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

    if (!serverId || !attachment?.url || !attachment.url.includes(".mp3"))
      return null;

    return {
      discordCdnFilePath: attachment?.url,
      serverId: serverId,
      soundName: soundName,
      size: attachment.size,
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to upload your sound.",
        textChannel
      );
      return;
    }

    if (this._reservedWords.includes(params.soundName)) {
      sendMessage(
        `The name '${params.soundName}' is reserved by a command for the bot. Please pick something else.`,
        textChannel
      );
      return;
    }

    if (params.size > maxFileSizeInBytes) {
      sendMessage("Max file size is 5 MB", textChannel);
      return;
    }

    await this.uploadSound(
      params.soundName,
      params.serverId,
      params.discordCdnFilePath,
      textChannel
    );
  }

  private async uploadSound(
    soundName: string,
    serverId: string,
    discordCdnFilePath: string,
    textChannel: Discord.TextChannel
  ) {
    if (!fs.existsSync(`${soundsDirPath}/${serverId}`)) {
      await fsAsync.mkdir(`${soundsDirPath}/${serverId}`);
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
      `${soundsDirPath}/${serverId}/${soundName}.mp3`
    );

    const response = await fetch(discordCdnFilePath);

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

    response.body.pipe(writeStream);
  }
}

export default UploadSoundCommandHandler;
