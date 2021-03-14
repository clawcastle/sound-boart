import Discord from "discord.js";
import fs from "fs";
import { soundsDirPath } from "../config";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler";
const fsAsync = fs.promises;

type UploadSoundCommandHandlerParams = {
  discordCdnFilePath: string;
  serverId: string;
  soundName: string;
};

class UploadSoundCommandHandler implements ICommandHandler {
  activate(command: Discord.Message) {
    const commandParts = command.content.split(" ");

    return (
      (commandParts[0] == "up" || commandParts[0] == "upload") &&
      commandParts.length > 2 &&
      Boolean(command.attachments)
    );
  }

  parseCommand(
    command: Discord.Message
  ): UploadSoundCommandHandlerParams | null {
    const commandParts = command.content.split(" ");
    const attachment = command.attachments.first();

    const soundName = commandParts[2];
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

    if (!params) return;

    await this.uploadSound(
      params.soundName,
      params.serverId,
      params.discordCdnFilePath
    );
  }

  private async uploadSound(
    soundName: string,
    serverId: string,
    discordCdnFilePath: string
  ) {
    if (!fs.existsSync(soundsDirPath)) {
      await fsAsync.mkdir(soundsDirPath);
    }

    await this.downloadSoundFromDiscordAttachment(
      discordCdnFilePath,
      serverId,
      soundName,
      () => {
        console.log("Sound uploaded");
      }
    );
  }

  private async downloadSoundFromDiscordAttachment(
    discordCdnFilePath: string,
    serverId: string,
    soundName: string,
    onFinishedCallback: () => void
  ) {
    const writeStream = fs.createWriteStream(
      `${soundsDirPath}/${serverId}/${soundName}`
    );

    const response = await fetch(discordCdnFilePath);
    response.body.pipe(writeStream);
    writeStream
      .on("finish", () => {
        writeStream.close();
        onFinishedCallback();
      })
      .on("error", (err) => {
        console.log(err);
      });
  }
}

export default UploadSoundCommandHandler;
