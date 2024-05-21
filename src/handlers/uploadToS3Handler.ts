import Discord from "discord.js";
import fs from "fs";
import { S3Config } from "../config.js";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { uploadEvent, events } from "../soundBoartEvents.js";
import { Command } from "../command.js";
import {
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { fileOrDirectoryExists } from "../utils/fsHelpers.js";
import { S3InfoService } from "../s3/s3InfoService.js";
const fsAsync = fs.promises;

export type UploadToS3HandlerParams = {
  localFilePath: string;
  soundName: string;
};

class UploadToS3Handler implements ICommandHandler<UploadToS3HandlerParams> {
  private _s3InfoService: S3InfoService;
  private _s3Client: S3Client;
  private _bucketName: string;

  constructor(s3config: S3Config) {
    this._bucketName = s3config.bucketName;

    this._s3InfoService = new S3InfoService();
    this._s3Client = new S3Client({
      region: s3config.region,
      endpoint: s3config.endpoint,
      credentials: {
        accessKeyId: s3config.accessKeyId,
        secretAccessKey: s3config.secretAccessKey,
      },
    });
  }

  activate(command: Command<UploadToS3HandlerParams>): boolean {
    return true;
  }

  parseCommandPayload(
    command: Command<UploadToS3HandlerParams>
  ): UploadToS3HandlerParams {
    return command.payload;
  }

  async handleCommand(
    command: Command<UploadToS3HandlerParams>
  ): Promise<void> {
    const { localFilePath, soundName } = command.payload;

    const fileExists = await fileOrDirectoryExists(localFilePath);

    if (!fileExists) {
      console.log(
        `Received event to upload file with path '${localFilePath}' to s3, but file does not exist.`
      );
      return;
    }

    const putObjectCommand = await this.createPutObjectCommand(
      command.context.serverId,
      soundName,
      localFilePath
    );

    try {
      await this._s3Client.send(putObjectCommand);
      await this._s3InfoService.addSoundFilesUploadedToS3(
        command.context.serverId,
        [soundName]
      );

      console.log(
        `Uploaded sound file '${soundName}' for server ${command.context.serverId} to S3.`
      );
    } catch (error) {
      console.error("An error occured while uploading file to s3.", error);
    }
  }

  private async createPutObjectCommand(
    serverId: string,
    soundName: string,
    localFilePath: string
  ): Promise<PutObjectCommand> {
    const fileContent = await fsAsync.readFile(localFilePath);

    const key = `servers/${serverId}/sounds/${soundName}.mp3`;

    return new PutObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      Body: fileContent,
    });
  }
}

export default UploadToS3Handler;
