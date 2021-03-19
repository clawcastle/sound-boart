import ServerSettings from "./serverSettings";

const cache: { [key: string]: ServerSettings } = {};

export function insertSettings(serverId: string, settings: ServerSettings) {
  cache[serverId] = settings;
}

export function getSettings(serverId: string): ServerSettings | null {
  if (!cache[serverId]) return null;

  return cache[serverId];
}

export function removeSettings(serverId: string) {
  if (cache[serverId]) delete cache[serverId];
}
