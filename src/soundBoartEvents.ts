import { prefix } from "./config";

export type SoundBoartEvent = { aliases: string[] };

export const uploadEvent = {
  aliases: ["up", "upload"],
};

export const listEvent = {
  aliases: ["l", "list"],
};

export const playEvent = {
  aliases: ["play"],
};

export const deleteEvent = {
  aliases: ["rm", "del", "remove", "delete"],
};

export const renameEvent = {
  aliases: ["rename"],
};

export const tagSoundEvent = {
  aliases: ["tag"],
};

export const listTagsEvent = {
  aliases: ["tags", "listtags"],
};

export const deleteTagEvent = {
  aliases: ["rmtag", "removetag", "deletetag"],
};

export const listSoundsWithTagEvent = {
  aliases: ["tagged"],
};

export const renameTagEvent = {
  aliases: ["renametag"],
};

export const events = [
  uploadEvent,
  listEvent,
  playEvent,
  deleteEvent,
  renameEvent,
  tagSoundEvent,
  listTagsEvent,
  deleteTagEvent,
  listSoundsWithTagEvent,
  renameTagEvent,
];
