import fs from "fs";
import { Paths, fileOrDirectoryExists } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;

export interface SoundUploadedToS3 {
  soundName: string;
  uploadedAtTimestamp: number;
}

export interface S3Info {
  soundsUploadedToS3: SoundUploadedToS3[];
}

const x: SoundUploadedToS3[] = [];
const defaultS3Info: S3Info = { soundsUploadedToS3: x };

export class S3InfoService {
  async addSoundFilesUploadedToS3(
    serverId: string,
    soundNames: string[]
  ): Promise<void> {
    const filePath = Paths.s3InfoFile(serverId);

    const fileExists = await fileOrDirectoryExists(filePath);

    if (!fileExists) {
      await fsAsync.mkdir(Paths.s3InfoDirectory(serverId), {
        recursive: true,
      });

      await fsAsync.writeFile(filePath, JSON.stringify(defaultS3Info));
    }

    const fileContent = await fsAsync.readFile(filePath, "utf-8");

    const existingS3Info = (JSON.parse(fileContent) as S3Info) ?? defaultS3Info;
    const now = new Date().valueOf();

    const soundNamesSet = new Set(soundNames);

    const updatedSoundsUploadedToS3: SoundUploadedToS3[] =
      existingS3Info.soundsUploadedToS3
        .filter((s) => !soundNamesSet.has(s.soundName))
        .concat(
          soundNames.map((soundName) => ({
            soundName: soundName,
            uploadedAtTimestamp: now,
          }))
        );

    const updatedS3Info: S3Info = {
      soundsUploadedToS3: updatedSoundsUploadedToS3,
    };

    await fsAsync.writeFile(filePath, JSON.stringify(updatedS3Info));
  }
}
