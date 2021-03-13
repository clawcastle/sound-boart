import Discord from "discord.js";
import express from "express";
import { botToken } from "./config";

const discordClient = new Discord.Client();
const app = express();

discordClient.login(botToken);

discordClient.on("voiceStateUpdate", async (oldState, newState) => {
  const userJoinedChannel = !oldState.channel && !!newState.channel;

  if (userJoinedChannel) {
    console.log("Hey du der!");
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
