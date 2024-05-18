import Discord from "discord.js";
import fs from "fs";
import { S3Config } from "../config.js";
import fetch from "node-fetch";
import ICommandHandler from "./commandHandler.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { uploadEvent, events } from "../soundBoartEvents.js";
import { Command } from "../command.js";
import { S3Client } from "@aws-sdk/client-s3";
const fsAsync = fs.promises;

type UploadToS3HandlerParams = {
  filePath: string;
};

class UploadToS3Handler implements ICommandHandler<UploadToS3HandlerParams> {
  private _s3Client: S3Client;

  constructor(s3config: S3Config) {
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
  ): Promise<void> {}
}

export default UploadToS3Handler;
