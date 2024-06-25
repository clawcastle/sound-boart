import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { S3Config } from "../config.js";
import fs from "fs";
const fsAsync = fs.promises;

export class S3SynchronizationJob {
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

  async run(): Promise<void> {
    const servers = 
  }

  private async fetchObjectKeysForServer(serverId: string): Promise<string[]> {
    const prefix = `servers/${serverId}/sounds/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: this._bucketName,
      Prefix: prefix,
    });

    let continuationToken: string | undefined;

    const result = [];

    do {
      const response = await this._s3Client.send(listCommand);

      const objectKeys = (response.Contents?.map((o) => o.Key).filter(
        (key) => !!key
      ) ?? []) as string[];

      result.push(...objectKeys);

      continuationToken = response.ContinuationToken;
    } while (continuationToken);

    return result;
  }
}
