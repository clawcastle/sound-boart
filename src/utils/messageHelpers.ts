import { prefix } from "../config";

export function getCommandParts(commandContent: string) {
  return commandContent.replace(prefix, "").trimStart().split(" ");
}
