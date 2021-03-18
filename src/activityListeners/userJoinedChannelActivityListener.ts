import IActivityListener from "./activityListener";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import fs from "fs";
import ServerSettings from "../serverSettings/serverSettings";
const fsAsync = fs.promises;

type UserJoinedChannelActivity = {
  serverId: string;
  userId: string;
  voiceChannel: Discord.VoiceChannel;
};

class UserJoinedChannelActivityListener
  implements IActivityListener<UserJoinedChannelActivity> {
  async onActivity({
    userId,
    serverId,
    voiceChannel,
  }: UserJoinedChannelActivity) {
    const settingsPath = `${soundsDirPath}/${serverId}/settings.json`;

    const settingsJson = await fsAsync.readFile(settingsPath, "utf-8");

    const serverSettings = JSON.parse(settingsJson) as ServerSettings;

    if (!serverSettings || !serverSettings.greetings[userId]) return;

    const userGreetingSoundName = serverSettings.greetings[userId];
    const soundFilePath = `${soundsDirPath}/${serverId}/${userGreetingSoundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) return;

    const conn = await voiceChannel.join();

    conn.play(soundFilePath).on("finish", () => {
      //TODO: reset timer here when implemented
    });
  }
}
