import { prefix, commandPartsCacheSize } from "../config.js";

export function splitCommandContent(commandContent: string) {
  return commandContent.replace(prefix, "").trimStart().split(" ");
}

function getCommandPartsMemoized() {
  let cache: { [key: string]: string[] } = {};

  return (commandContent: string) => {
    if (!cache[commandContent]) {
      //Clear cache when we reach a certain limit to not end up keeping too many arrays in memory
      if (Object.keys(cache).length >= commandPartsCacheSize) {
        cache = {};
      }
      cache[commandContent] = splitCommandContent(commandContent);
    }

    return cache[commandContent];
  };
}

export const getCommandParts = getCommandPartsMemoized();
