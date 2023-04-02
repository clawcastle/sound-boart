import Discord from "discord.js";
import fs from "fs";
import { soundsDirPath, prefix, maxFileSizeInBytes } from "../config.js";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { uploadEvent, events } from "../soundBoartEvents.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { Command } from "../command.js";
const fsAsync = fs.promises;

type UploadSoundCommandHandlerParams = {
  discordCdnFilePath: string;
  serverId: string;
  soundName: string;
  size: number;
};

class UploadSoundCommandHandler implements ICommandHandler<Discord.Message> {
  private _reservedWords: Set<string>;
  constructor() {
    this._reservedWords = new Set();
    events.forEach((event) => {
      event.aliases.forEach((alias) => {
        this._reservedWords.add(alias);
      });
    });
  }

  activate({ content, attachments }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return (
      commandParts.length > 1 &&
      uploadEvent.aliases.includes(commandParts[0]) &&
      Boolean(attachments)
    );
  }

  parseCommandPayload({
    attachments,
    content,
    guild,
  }: Discord.Message): UploadSoundCommandHandlerParams | null {
    const commandParts = getCommandParts(content);
    const attachment = attachments.first();

    const soundName = commandParts[1];
    const serverId = guild?.id;

    if (!serverId || !attachment?.url || !attachment.url.includes(".mp3"))
      return null;

    return {
      discordCdnFilePath: attachment?.url,
      serverId: serverId,
      soundName: soundName,
      size: attachment.size,
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to upload your sound.",
        textChannel
      );
      return;
    }

    if (this._reservedWords.has(params.soundName)) {
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
      await fsAsync.mkdir(`${soundsDirPath}/${serverId}`, { recursive: true });
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

    if (!response.body) {
      sendMessage(
        "Something went wrong while trying to upload your sound.",
        textChannel
      );
      return;
    }

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
