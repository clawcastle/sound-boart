export type CommandHelpInfo = {
  title: string;
  description: string;
};

export const deleteSound = {
  title: "Delete sound",
  description: "Deletes a sound. Use like this: $delete <sound-name>",
};

export const deleteTag = {
  title: "Delete tag",
  description:
    "Deletes a tag (not the sounds within the tag). Use like this: $delete <tag-name>",
};

export const listSounds = {
  title: "List sounds",
  description:
    "Lists all sounds available for the server. Use like this: $list",
};

export const listSoundsWithTag = {
  title: "List sounds with tag",
  description:
    "Lists all sounds tagged with a specific tag. Use like this: $tagged <tag-name>",
};

export const listTags = {
  title: "List tags",
  description: "Lists all tags. Use like this: $tags",
};

export const playSound = {
  title: "Play sound",
  description:
    "Plays a sound by the name specified if it exists. Use like this: $<sound-name>",
};

export const removeGreetingSound = {
  title: "Remove greeting sound",
  description:
    "Clears your greeting sound if you have specified one (does not delete the sound). Use this this: $remove-greet",
};

export const renameSound = {
  title: "Rename sound",
  description:
    "Renames a sound. Use like this: $rename <sound-name> <new-sound-name>",
};

export const renameTag = {
  title: "Rename tag",
  description:
    "Renames a tag. Use like this: $rename-tag <tag-name> <new-tag-name>",
};

export const setGreetingSound = {
  title: "Set greeting sound",
  description:
    "Sets the sound to be played when you join a voice channel. Use like this: $set-greet <sound-name>",
};

export const tagSound = {
  title: "Tag sound",
  description:
    "Tags a sound with a name. Can be used for categorizing sounds so they can easily be found. Use like this: $tag <sound-name> <tag-name>",
};

export const uploadSound = {
  title: "Upload sound",
  description:
    "Uploads a sound to the server. The sound can then be referenced and played by the name you specify in this command (not the name of the file you upload). The file should be sent as an attachment to the message you send with the upload command. Mind that only .mp3 files are valid. Use like this: $up <sound-name>",
};

export const helpInfo = [
  deleteSound,
  deleteTag,
  listSounds,
  listSoundsWithTag,
  listTags,
  playSound,
  removeGreetingSound,
  renameSound,
  renameTag,
  setGreetingSound,
  tagSound,
  uploadSound,
];
