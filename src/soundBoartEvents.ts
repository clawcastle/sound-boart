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
  aliases: ["tags", "list-tags"],
};

export const deleteTagEvent = {
  aliases: ["rmtag", "remove-tag", "delete-tag"],
};

export const listSoundsWithTagEvent = {
  aliases: ["tagged"],
};

export const renameTagEvent = {
  aliases: ["rename-tag"],
};

export const setGreetingSoundEvent = {
  aliases: ["set-greet"],
};

export const playGreetingSoundEvent = {
  aliases: ["play-greet"],
};

export const removeGreetingSoundEvent = {
  aliases: ["rm-greet", "remove-greet", "delete-greet"],
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
  setGreetingSoundEvent,
  playGreetingSoundEvent,
  removeGreetingSoundEvent,
];
