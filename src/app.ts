import Discord from "discord.js";
import express from "express";
import { botToken, prefix } from "./config";
import SoundBoartEventEmitter from "./soundBoartEventEmitter";
import UploadSoundCommandHandler from "./handlers/uploadSoundHandler";
import { uploadEvent } from "./soundBoartEvents";

const discordClient = new Discord.Client();
const eventEmitter = new SoundBoartEventEmitter();
const app = express();

discordClient.login(botToken);

const uploadSoundHandler = new UploadSoundCommandHandler();
eventEmitter.register(uploadEvent, uploadSoundHandler);

discordClient.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = message.content.split(" ");
  if (messageParts.length <= 1) return;

  eventEmitter.emit(messageParts[1]);
});

discordClient.on("voiceStateUpdate", async (oldState, newState) => {
  const userJoinedChannel = !oldState.channel && !!newState.channel;

  if (userJoinedChannel) {
    console.log("User joined");
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
