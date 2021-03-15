import Discord from "discord.js";
import express from "express";
import { botToken, prefix } from "./config";
import SoundBoartEventEmitter from "./soundBoartEventEmitter";
import UploadSoundCommandHandler from "./handlers/uploadSoundHandler";
import ListSoundsCommandHandler from "./handlers/listSoundsHandler";
import PlaySoundCommandHandler from "./handlers/playSoundHandler";
import DeleteSoundCommandHandler from "./handlers/deleteSoundHandler";
import {
  uploadEvent,
  listEvent,
  playEvent,
  deleteEvent,
  events,
} from "./soundBoartEvents";
import { getCommandParts } from "./utils/messageHelpers";

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

discordClient.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = getCommandParts(message.content);
  if (messageParts.length === 0) return;

  //TODO: Optimize this check
  //There is no alias for play, so we just try and invoke it if no other aliases match
  if (
    !events.some((e) => e.aliases.some((alias) => alias == messageParts[0]))
  ) {
    eventEmitter.emit("play", message);
    return;
  }

  eventEmitter.emit(messageParts[0], message);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
