export type SoundBoartEvent = { aliases: string[]; internal: boolean };

export const uploadEvent: SoundBoartEvent = {
  aliases: ["up", "upload"],
  internal: false,
};

export const listEvent: SoundBoartEvent = {
  aliases: ["l", "list"],
  internal: false,
};

export const playEvent: SoundBoartEvent = {
  aliases: ["play"],
  internal: false,
};

export const deleteEvent: SoundBoartEvent = {
  aliases: ["rm", "del", "remove", "delete"],
  internal: false,
};

export const renameEvent: SoundBoartEvent = {
  aliases: ["rename"],
  internal: false,
};

export const tagSoundEvent: SoundBoartEvent = {
  aliases: ["tag"],
  internal: false,
};

export const listTagsEvent: SoundBoartEvent = {
  aliases: ["tags", "list-tags"],
  internal: false,
};

export const deleteTagEvent: SoundBoartEvent = {
  aliases: ["rmtag", "remove-tag", "delete-tag"],
  internal: false,
};

export const listSoundsWithTagEvent: SoundBoartEvent = {
  aliases: ["tagged"],
  internal: false,
};

export const renameTagEvent: SoundBoartEvent = {
  aliases: ["rename-tag"],
  internal: false,
};

export const setGreetingSoundEvent: SoundBoartEvent = {
  aliases: ["set-greet"],
  internal: false,
};

export const playGreetingSoundEvent: SoundBoartEvent = {
  aliases: ["play-greet"],
  internal: false,
};

export const removeGreetingSoundEvent: SoundBoartEvent = {
  aliases: ["rm-greet", "remove-greet", "delete-greet"],
  internal: false,
};

export const helpEvent: SoundBoartEvent = {
  aliases: ["help"],
  internal: false,
};

export const playRandomSoundEvent: SoundBoartEvent = {
  aliases: ["rnd", "random"],
  internal: false,
};

export const searchEvent: SoundBoartEvent = {
  aliases: ["find", "search"],
  internal: false,
};

export const soundPlayedEvent: SoundBoartEvent = {
  aliases: ["sound-played"],
  internal: true,
};

export const listTopSoundsEvent: SoundBoartEvent = {
  aliases: ["top"],
  internal: false,
};

export const setPrefixEvent: SoundBoartEvent = {
  aliases: ["set-prefix"],
  internal: false,
};

export const uploadToS3Event = {
  aliases: ["upload-to-s3"],
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
  helpEvent,
  playRandomSoundEvent,
  searchEvent,
  soundPlayedEvent,
  listTopSoundsEvent,
  setPrefixEvent,
];

export const publicEventAliases = new Set(
  events.filter((e) => !e.internal).flatMap((e) => e.aliases)
);
