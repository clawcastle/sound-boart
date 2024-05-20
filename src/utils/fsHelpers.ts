import fs from "fs";
const fsAsync = fs.promises;

export const fileOrDirectoryExists = async (
  filePath: string
): Promise<boolean> => {
  return await fsAsync
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
};
