import fs from "fs";
import { S3Config } from "../config.js";
import ICommandHandler from "./commandHandler.js";
import { Command } from "../command.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fileOrDirectoryExists } from "../utils/fsHelpers.js";
const fsAsync = fs.promises;

export type DeleteFromS3HandlerParams = {
  localFilePath: string;
  soundName: string;
};
