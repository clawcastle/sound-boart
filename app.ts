import Discord from "discord.js";
import { botToken, prefix } from "./src/config";
import { soundBoartEventEmitter } from "./src/soundBoartEventEmitter";
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
  helpEvent,
  playRandomSoundEvent,
  searchEvent,
  soundPlayedEvent,
  listTopSoundsEvent,
} from "./src/soundBoartEvents";
import { getCommandParts } from "./src/utils/messageHelpers";
import SetGreetSoundCommandHandler from "./src/handlers/setGreetingSoundHandler";
import PlayGreetingSoundCommandHandler from "./src/handlers/playGreetingSoundHandler";
import RemoveGreetingSoundCommandHandler from "./src/handlers/removeGreetingSoundHandler";
import HelpCommandHandler from "./src/handlers/helpHandler";
import PlayRandomSoundCommandHandler from "./src/handlers/playRandomSoundHandler";
import SearchCommandHandler from "./src/handlers/searchHandler";
import RecordSoundPlayedCommandHandler from "./src/handlers/recordSoundPlayedHandler";
import http from "http";
import ListTopSoundsCommandHandler from "./src/handlers/listTopSoundsHandler";

const eventAliasesSet = new Set<string>();

events.forEach((e) => {
  e.aliases.forEach((alias) => {
    eventAliasesSet.add(alias);
  });
});

const discordClient = new Discord.Client();

discordClient.login(botToken);

const uploadSoundHandler = new UploadSoundCommandHandler();
soundBoartEventEmitter.registerHandler(uploadEvent, uploadSoundHandler);

const listSoundsHandler = new ListSoundsCommandHandler();
soundBoartEventEmitter.registerHandler(listEvent, listSoundsHandler);

const playSoundHandler = new PlaySoundCommandHandler();
soundBoartEventEmitter.registerHandler(playEvent, playSoundHandler);

const deleteSoundHandler = new DeleteSoundCommandHandler();
soundBoartEventEmitter.registerHandler(deleteEvent, deleteSoundHandler);

const renameSoundHandler = new RenameSoundCommandHandler();
soundBoartEventEmitter.registerHandler(renameEvent, renameSoundHandler);

const tagSoundHandler = new TagSoundCommandHandler();
soundBoartEventEmitter.registerHandler(tagSoundEvent, tagSoundHandler);

const listTagsHandler = new ListTagsCommandHandler();
soundBoartEventEmitter.registerHandler(listTagsEvent, listTagsHandler);

const deleteTagHandler = new DeleteTagCommandHandler();
soundBoartEventEmitter.registerHandler(deleteTagEvent, deleteTagHandler);

const listSoundsWithTagHandler = new ListSoundsWithTagCommandHandler();
soundBoartEventEmitter.registerHandler(
  listSoundsWithTagEvent,
  listSoundsWithTagHandler
);

const renameTagHandler = new RenameTagCommandHandler();
soundBoartEventEmitter.registerHandler(renameTagEvent, renameTagHandler);

const setGreetSoundHandler = new SetGreetSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  setGreetingSoundEvent,
  setGreetSoundHandler
);

const playGreetingSoundHandler = new PlayGreetingSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  playGreetingSoundEvent,
  playGreetingSoundHandler
);

const removeGreetingSoundHandler = new RemoveGreetingSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  removeGreetingSoundEvent,
  removeGreetingSoundHandler
);

const helpCommandHandler = new HelpCommandHandler();
soundBoartEventEmitter.registerHandler(helpEvent, helpCommandHandler);

const playRandomSoundHandler = new PlayRandomSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  playRandomSoundEvent,
  playRandomSoundHandler
);

const searchHandler = new SearchCommandHandler();
soundBoartEventEmitter.registerHandler(searchEvent, searchHandler);

const recordSoundPlayedHandler = new RecordSoundPlayedCommandHandler();
soundBoartEventEmitter.registerHandler(
  soundPlayedEvent,
  recordSoundPlayedHandler
);

const listTopSoundsHandler = new ListTopSoundsCommandHandler();
soundBoartEventEmitter.registerHandler(
  listTopSoundsEvent,
  listTopSoundsHandler
);

discordClient.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = getCommandParts(message.content);
  if (messageParts.length === 0) return;

  //There is no alias for play, so we just try and invoke it if no other aliases match
  if (!eventAliasesSet.has(messageParts[0])) {
    soundBoartEventEmitter.emit("play", message);
    return;
  }

  soundBoartEventEmitter.emit(messageParts[0], message);
});

discordClient.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  soundBoartEventEmitter.emit("play-greet", { oldVoiceState, newVoiceState });
});

const server = http.createServer((_, res) => {
  res.end();
});

server.listen(3000);
