import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3Config, soundboartConfig } from "../config.js";
import fs from "fs";
import { SoundObjectKey } from "../utils/s3.js";
import { Paths } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;

type SoundNamesGroupedByServers = Map<string, Set<string>>;

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
    const startedAt = new Date();

    console.log("Starting S3 synchronization job.");

    const soundObjectKeys = await this.listSoundObjects();
    const soundNamesGroupedByServerId =
      await this.listSoundNamesGroupedByServer();

    const serverIds = new Set(
      soundObjectKeys
        .map((objectKey) => objectKey.serverId)
        .concat([...soundNamesGroupedByServerId.keys()])
    );

    const findSoundsToDownloadForServer = (
      serverId: string
    ): SoundObjectKey[] => {
      const soundNamesExistingLocally =
        soundNamesGroupedByServerId.get(serverId) ?? new Set();

      const soundNamesFromS3 = new Set(
        soundObjectKeys
          .filter((objectKey) => objectKey.serverId === serverId)
          .map((objectKey) => objectKey.soundName)
      );

      const toDownload = new Array(...soundNamesFromS3)
        .filter((s) => !soundNamesExistingLocally.has(s))
        .map((soundName) => new SoundObjectKey(serverId, soundName));

      return toDownload;
    };

    const findSoundsToUploadForServer = (
      serverId: string
    ): SoundObjectKey[] => {
      const alreadyUploadedSoundNames = new Set(
        soundObjectKeys
          .filter((objectKey) => objectKey.serverId === serverId)
          .map((objectKey) => objectKey.soundName)
      );

      const existingSoundNamesForServer =
        soundNamesGroupedByServerId.get(serverId) ?? new Set();

      const toUpload = new Array(...existingSoundNamesForServer)
        .filter((s) => !alreadyUploadedSoundNames.has(s))
        .map((soundName) => new SoundObjectKey(serverId, soundName));

      return toUpload;
    };

    serverIds.forEach(async (serverId) => {
      const toDownload = findSoundsToDownloadForServer(serverId);
      const toUpload = findSoundsToUploadForServer(serverId);

      console.log(
        `Found ${toUpload.length} files to upload and ${toDownload.length} files to download for server ${serverId}.`
      );

      toDownload.forEach(async (soundToDownload) => {
        const objectKey = soundToDownload.serialize();

        const getObjectCommand = new GetObjectCommand({
          Bucket: this._bucketName,
          Key: objectKey,
        });

        const response = await this._s3Client.send(getObjectCommand);

        const localFilePath = Paths.soundFile(
          soundToDownload.serverId,
          soundToDownload.soundName.replace(".mp3", "")
        );

        if (!response.Body) {
          console.error(
            `Could not download file with key ${objectKey} from S3.`
          );
          return;
        }

        response.Body.transformToByteArray().then(async (buffer) => {
          await fsAsync.writeFile(localFilePath, buffer);

          console.log(`Downloaded file with key ${objectKey} from S3.`);
        });
      });

      toUpload.forEach(async (soundToUpload) => {
        const objectKey = soundToUpload.serialize();

        const localFilePath = Paths.soundFile(
          soundToUpload.serverId,
          soundToUpload.soundName.replace(".mp3", "")
        );

        const fileContent = await fsAsync.readFile(localFilePath);

        const putObjectCommand = new PutObjectCommand({
          Bucket: this._bucketName,
          Key: objectKey,
          Body: fileContent,
        });

        await this._s3Client.send(putObjectCommand);

        console.log(`Uploaded file with key ${objectKey} to S3.`);
      });
    });

    const elapsedTime = new Date().getTime() - startedAt.getTime();

    console.log(`S3 synchronization finished. Elapsed time: ${elapsedTime}ms`);
  }

  private async listSoundNamesGroupedByServer(): Promise<SoundNamesGroupedByServers> {
    const serverIds = await fsAsync.readdir(soundboartConfig.soundsDirectory);

    const soundNamesGroupedByServers = await Promise.all(
      serverIds.map(async (serverId) => {
        const soundNames = await fsAsync.readdir(
          Paths.soundFilesDirectory(serverId)
        );

        return { serverId, soundNames: new Set(soundNames) };
      })
    );

    return new Map(
      soundNamesGroupedByServers.map((x) => [x.serverId, x.soundNames])
    );
  }

  private async listSoundObjects(): Promise<SoundObjectKey[]> {
    const prefix = "/sounds/";

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
