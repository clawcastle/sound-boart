import * as Discord from "discord.js";
import express from "express";
import { botToken, prefix } from "./src/config";
import SoundBoartEventEmitter from "./src/soundBoartEventEmitter";
import UploadSoundCommandHandler from "./src/handlers/uploadSoundHandler";
import ListSoundsCommandHandler from "./src/handlers/listSoundsHandler";
import PlaySoundCommandHandler from "./src/handlers/playSoundHandler";
import DeleteSoundCommandHandler from "./src/handlers/deleteSoundHandler";
import RenameSoundCommandHandler from "./src/handlers/renameSoundHandler";
import TagSoundCommandHandler from "./src/handlers/tagSoundHandler";
import ListTagsCommandHandler from "./src/handlers/listTagsHandler";
import DeleteTagCommandHandler from "./src/handlers/deleteTagHandler";
import ListSoundsWithTagCommandHandler from "./src/handlers/listSoundsWithTagHandler";
import RenameTagCommandHandler from "./src/handlers/renameTagHandler";
import {
  uploadEvent,
  listEvent,
  playEvent,
  deleteEvent,
  events,
  renameEvent,
  tagSoundEvent,
  listTagsEvent,
  deleteTagEvent,
  listSoundsWithTagEvent,
  renameTagEvent,
  setGreetingSoundEvent,
  playGreetingSoundEvent,
  removeGreetingSoundEvent,
} from "./src/soundBoartEvents";
import { getCommandParts } from "./src/utils/messageHelpers";
import SetGreetSoundCommandHandler from "./src/handlers/setGreetingSoundHandler";
import PlayGreetingSoundCommandHandler from "./src/handlers/playGreetingSoundHandler";
import RemoveGreetingSoundCommandHandler from "./src/handlers/removeGreetingSoundHandler";

const eventAliasesSet = new Set<string>();

events.forEach((e) => {
  e.aliases.forEach((alias) => {
    eventAliasesSet.add(alias);
  });
});

const discordClient = new Discord.Client();
const eventEmitter = new SoundBoartEventEmitter();
const app = express();

discordClient.login(botToken);

const uploadSoundHandler = new UploadSoundCommandHandler();
eventEmitter.registerHandler(uploadEvent, uploadSoundHandler);

const listSoundsHandler = new ListSoundsCommandHandler();
eventEmitter.registerHandler(listEvent, listSoundsHandler);

const playSoundHandler = new PlaySoundCommandHandler();
eventEmitter.registerHandler(playEvent, playSoundHandler);

const deleteSoundHandler = new DeleteSoundCommandHandler();
eventEmitter.registerHandler(deleteEvent, deleteSoundHandler);

const renameSoundHandler = new RenameSoundCommandHandler();
eventEmitter.registerHandler(renameEvent, renameSoundHandler);

const tagSoundHandler = new TagSoundCommandHandler();
eventEmitter.registerHandler(tagSoundEvent, tagSoundHandler);

const listTagsHandler = new ListTagsCommandHandler();
eventEmitter.registerHandler(listTagsEvent, listTagsHandler);

const deleteTagHandler = new DeleteTagCommandHandler();
eventEmitter.registerHandler(deleteTagEvent, deleteTagHandler);

const listSoundsWithTagHandler = new ListSoundsWithTagCommandHandler();
eventEmitter.registerHandler(listSoundsWithTagEvent, listSoundsWithTagHandler);

const renameTagHandler = new RenameTagCommandHandler();
eventEmitter.registerHandler(renameTagEvent, renameTagHandler);

const setGreetSoundHandler = new SetGreetSoundCommandHandler();
eventEmitter.registerHandler(setGreetingSoundEvent, setGreetSoundHandler);

const playGreetingSoundHandler = new PlayGreetingSoundCommandHandler();
eventEmitter.registerHandler(playGreetingSoundEvent, playGreetingSoundHandler);

const removeGreetingSoundHandler = new RemoveGreetingSoundCommandHandler();
eventEmitter.registerHandler(
  removeGreetingSoundEvent,
  removeGreetingSoundHandler
);

discordClient.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = getCommandParts(message.content);
  if (messageParts.length === 0) return;

  //There is no alias for play, so we just try and invoke it if no other aliases match
  if (!eventAliasesSet.has(messageParts[0])) {
    eventEmitter.emit("play", message);
    return;
  }

  eventEmitter.emit(messageParts[0], message);
});

discordClient.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  eventEmitter.emit("play-greet", { oldVoiceState, newVoiceState });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
