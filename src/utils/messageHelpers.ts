export function getCommandParts(prefix: string, commandContent: string) {
  return commandContent.replace(prefix, "").trimStart().split(" ");
}
