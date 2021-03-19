const deleteSound = "Deletes a sound. Use like this: $delete <sound-name> \n";
const deleteTag =
  "Deletes a tag (not the sounds within the tag). Use like this: $delete <tag-name>";
const listSounds =
  "Lists all sounds available for the server. Use like this: $list";
const listSoundsWithTag =
  "Lists all sounds tagged with a specific tag. Use like this: $tagged <tag-name>";
const listTags = "Lists all tags. Use like this: $tags";
const playSound =
  "Plays a sound by the name specified if it exists. Use like this: $<sound-name>";
const removeGreetingSound =
  "Clears your greeting sound if you have specified one (does not delete the sound). Use this this: $remove-greet";
const renameSound =
  "Renames a sound. Use like this: $rename <sound-name> <new-sound-name>";
const renameTag =
  "Renames a tag. Use like this: $rename-tag <tag-name> <new-tag-name>";
const setGreetingSound =
  "Sets the sound to be played when you join a voice channel. Use like this: $set-greet <sound-name>";
const tagSound =
  "Tags a sound with a name. Can be used for categorizing sounds so they can easily be found. Use like this: $tag <sound-name> <tag-name>";
const uploadSound =
  "Uploads a sound to the server. The sound can then be referenced and played by the name you specify in this command (not the name of the file you upload). The file should be sent as an attachment to the message you send with the upload command. Mind that only .mp3 files are valid. Use like this: $up <sound-name>";

export {
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
};
