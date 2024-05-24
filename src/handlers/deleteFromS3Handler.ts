import { S3Config } from "../config.js";
import ICommandHandler from "./commandHandler.js";
import { Command } from "../command.js";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type DeleteFromS3HandlerParams = {
  soundName: string;
};

class DeleteFromS3Handler
  implements ICommandHandler<DeleteFromS3HandlerParams>
{
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

  activate(command: Command<DeleteFromS3HandlerParams>): boolean {
    return true;
  }

  parseCommandPayload(
    command: Command<DeleteFromS3HandlerParams>
  ): DeleteFromS3HandlerParams {
    return command.payload;
  }

  async handleCommand(
    command: Command<DeleteFromS3HandlerParams>
  ): Promise<void> {
    const { soundName } = command.payload;

    const putObjectCommand = this.createDeleteCommand(
      command.context.serverId,
      soundName
    );

    try {
      await this._s3Client.send(putObjectCommand);

      console.log(
        `Deleted sound file '${soundName}' for server ${command.context.serverId} to S3.`
      );
    } catch (error) {
      console.error("An error occured while deleting file in s3.", error);
    }
  }

  private createDeleteCommand(
    serverId: string,
    soundName: string
  ): DeleteObjectCommand {
    const key = `servers/${serverId}/sounds/${soundName}.mp3`;

    return new DeleteObjectCommand({
      Bucket: this._bucketName,
      Key: key,
    });
  }
}

export default DeleteFromS3Handler;
