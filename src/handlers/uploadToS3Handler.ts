import fs from "fs";
import { S3Config } from "../config.js";
import ICommandHandler from "./commandHandler.js";
import { Command } from "../command.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";
import { SoundObjectKey } from "../utils/s3.js";
const fsAsync = fs.promises;

export type UploadToS3HandlerParams = {
  soundName: string;
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
    const { soundName } = command.payload;

    const soundFilePath = Paths.soundFile(command.context.serverId, soundName);

    const fileExists = await fileOrDirectoryExists(soundFilePath);

    if (!fileExists) {
      console.log(
        `Received event to upload file with path '${soundFilePath}' to s3, but file does not exist.`
      );
      return;
    }

    const putObjectCommand = await this.createPutObjectCommand(
      command.context.serverId,
      soundName,
      soundFilePath
    );

    try {
      await this._s3Client.send(putObjectCommand);

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

    const key = new SoundObjectKey(serverId, soundName).serialize();

    return new PutObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      Body: fileContent,
    });
  }
}

export default UploadToS3Handler;
