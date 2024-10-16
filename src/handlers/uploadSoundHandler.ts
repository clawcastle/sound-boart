import Discord from "discord.js";
import fs from "fs";
import { soundboartConfig } from "../config.js";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import {
  uploadEvent,
  publicEventAliases,
  uploadToS3Event,
} from "../soundBoartEvents.js";
import { Command, CommandContext } from "../command.js";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";
import { soundBoartEventEmitter } from "../soundBoartEventEmitter.js";
import { UploadToS3HandlerParams } from "./uploadToS3Handler.js";
const fsAsync = fs.promises;

const MAX_SOUND_NAME_LENGTH = 100;
const SOUND_NAME_ALLOWED_CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-!.*'()";

type UploadSoundCommandHandlerParams = {
  discordCdnFilePath: string;
  serverId: string;
  soundName: string;
  size: number;
};

class UploadSoundCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    const { commandParts } = command.context;

    return (
      commandParts.length > 1 &&
      uploadEvent.aliases.includes(commandParts[0]) &&
      Boolean(command.payload.attachments)
    );
  }

  parseCommandPayload(
    command: Command<Discord.Message>
  ): UploadSoundCommandHandlerParams | null {
    const { serverId, commandParts } = command.context;

    const attachment = command.payload.attachments.first();

    const soundName = commandParts[1];

    if (!serverId || !attachment?.url || !attachment.url.includes(".mp3"))
      return null;

    return {
      discordCdnFilePath: attachment?.url,
      serverId: serverId,
      soundName: soundName,
      size: attachment.size,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to upload your sound.",
        textChannel
      );
      return;
    }

    if (publicEventAliases.has(params.soundName)) {
      sendMessage(
        `The name '${params.soundName}' is reserved by a command for the bot. Please pick something else.`,
        textChannel
      );
      return;
    }

    if (params.size > soundboartConfig.maxFileSizeInBytes) {
      sendMessage("Max file size is 5 MB", textChannel);
      return;
    }

    if (params.soundName.length > MAX_SOUND_NAME_LENGTH) {
      sendMessage(
        `Sound name can not be more than ${MAX_SOUND_NAME_LENGTH} characters long.`,
        textChannel
      );
      return;
    }

    if (
      ![...params.soundName].every((char) =>
        SOUND_NAME_ALLOWED_CHARACTERS.includes(char)
      )
    ) {
      sendMessage(
        `Sound name can only contain the following characters: ${SOUND_NAME_ALLOWED_CHARACTERS}`,
        textChannel
      );

      return;
    }

    await this.uploadSound(
      params.soundName,
      params.discordCdnFilePath,
      textChannel,
      command.context
    );
  }

  private async uploadSound(
    soundName: string,
    discordCdnFilePath: string,
    textChannel: Discord.TextChannel,
    context: CommandContext
  ) {
    const { serverId } = context;

    const soundsDirectory = Paths.soundFilesDirectory(serverId);

    const serverSoundsDirectoryExists = await fileOrDirectoryExists(
      soundsDirectory
    );

    if (!serverSoundsDirectoryExists) {
      await fsAsync.mkdir(soundsDirectory, {
        recursive: true,
      });
    }

    await this.downloadSoundFromDiscordAttachment(
      discordCdnFilePath,
      soundName,
      textChannel,
      context
    );
  }

  private async downloadSoundFromDiscordAttachment(
    discordCdnFilePath: string,
    soundName: string,
    textChannel: Discord.TextChannel,
    context: CommandContext
  ) {
    const { serverId, prefix } = context;

    const filePath = Paths.soundFile(serverId, soundName);
    const writeStream = fs.createWriteStream(filePath);

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

        if (soundboartConfig.s3Config) {
          soundBoartEventEmitter.emit(
            uploadToS3Event.aliases[0],
            new Command<UploadToS3HandlerParams>(
              {
                soundName,
              },
              context
            )
          );
        }
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
