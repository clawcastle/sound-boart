export function splitCommandContent(prefix: string, commandContent: string) {
  return commandContent.replace(prefix, "").trimStart().split(" ");
}

function getCommandPartsMemoized() {
  let cache: { [key: string]: string[] } = {};

  return (prefix: string, commandContent: string) => {
    if (!cache[commandContent]) {
      //Clear cache when we reach a certain limit to not end up keeping too many arrays in memory
      if (Object.keys(cache).length >= 200) {
        cache = {};
      }
      cache[commandContent] = splitCommandContent(prefix, commandContent);
    }

    return cache[commandContent];
  };
}

export const getCommandParts = getCommandPartsMemoized();
