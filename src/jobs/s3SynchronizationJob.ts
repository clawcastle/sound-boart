import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { S3Config, soundboartConfig } from "../config.js";
import fs from "fs";
import { SoundObjectKey } from "../utils/s3.js";
import { Paths } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;

type SoundNamesGroupedByServers = Map<string, string[]>;

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
    const soundObjectKeys = await this.listSoundObjects();
    const soundNamesGroupedByServerId =
      await this.listSoundNamesGroupedByServer();
  }

  private async listSoundNamesGroupedByServer(): Promise<SoundNamesGroupedByServers> {
    const serverIds = await fsAsync.readdir(soundboartConfig.soundsDirectory);

    const soundNamesGroupedByServers = await Promise.all(
      serverIds.map(async (serverId) => {
        const soundNames = await fsAsync.readdir(
          Paths.soundFilesDirectory(serverId)
        );

        return { serverId, soundNames };
      })
    );

    return new Map(
      soundNamesGroupedByServers.map((x) => [x.serverId, x.soundNames])
    );
  }

  private async listSoundObjects(): Promise<SoundObjectKey[]> {
    const prefix = "sounds/";

    const listCommand = new ListObjectsV2Command({
      Bucket: this._bucketName,
      Prefix: prefix,
    });

    let continuationToken: string | undefined;

    const result: SoundObjectKey[] = [];

    do {
      const response = await this._s3Client.send(listCommand);

      const objectKeys = (response.Contents?.map((o) => o.Key).filter(
        (key) => !!key
      ) ?? []) as string[];

      const soundObjectKeys = objectKeys
        .map((objectKey) => SoundObjectKey.deserialize(objectKey))
        .filter(
          (soundObjectKey) => soundObjectKey !== null
        ) as SoundObjectKey[];

      result.push(...soundObjectKeys);

      continuationToken = response.ContinuationToken;
    } while (continuationToken);

    return result;
  }
}
