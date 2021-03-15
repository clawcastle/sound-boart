import Discord from "discord.js";
import express from "express";
import { botToken, prefix } from "./config";
import SoundBoartEventEmitter from "./soundBoartEventEmitter";
import UploadSoundCommandHandler from "./handlers/uploadSoundHandler";
import ListSoundsCommandHandler from "./handlers/listSoundsHandler";
import { uploadEvent, listEvent, playEvent, events } from "./soundBoartEvents";
import { getCommandParts } from "./utils/messageHelpers";

const discordClient = new Discord.Client();
const eventEmitter = new SoundBoartEventEmitter();
const app = express();

discordClient.login(botToken);

const uploadSoundHandler = new UploadSoundCommandHandler();
eventEmitter.registerHandler(uploadEvent, uploadSoundHandler);

const listSoundsHandler = new ListSoundsCommandHandler();
eventEmitter.registerHandler(listEvent, listSoundsHandler);

discordClient.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = getCommandParts(message.content);

  //TODO: Optimize this check
  //There is no alias for play, so we just try and invoke it if no other aliases match
  if (
    !events.some((e) => e.aliases.some((alias) => alias == messageParts[0]))
  ) {
    eventEmitter.emit("play", message);
    return;
  }

  if (messageParts.length === 0) return;

  eventEmitter.emit(messageParts[0], message);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
