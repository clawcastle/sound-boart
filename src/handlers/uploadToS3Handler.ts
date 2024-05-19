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
const fsAsync = fs.promises;

type FileKind = "sound" | "settings" | "usageMetrics";

type UploadToS3HandlerParams = {
  localFilePath: string;
  kind: FileKind;
};

class UploadToS3Handler implements ICommandHandler<UploadToS3HandlerParams> {
  private _s3Client: S3Client;
  private _bucketName: string;

  constructor(s3config: S3Config) {
    this._bucketName = s3config.bucketName;

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
    const { kind, localFilePath } = command.payload;

    const fileExists = await this.fileExists(localFilePath);

    if (!fileExists) {
      console.log(
        `Received event to upload file with path '${localFilePath}' to s3, but file does not exist.`
      );
      return;
    }

    const fileContent = await fsAsync.readFile(localFilePath);

    const putObjectCommand = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: "",
      Body: fileContent,
    });

    try {
      const response = await this._s3Client.send(putObjectCommand);
    } catch (error) {
      console.error("An error occured while uploading file to s3.", error);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    return await fsAsync
      .access(filePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }
}

export default UploadToS3Handler;
