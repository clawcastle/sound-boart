import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { getSettings } from "../serverSettings/settingsManager";
import { soundsDirPath } from "../config";
import fs from "fs";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer";

type VoiceStateUpdate = {
  oldVoiceState: Discord.VoiceState;
  newVoiceState: Discord.VoiceState;
};

type PlayGreetingSoundCommandHandlerArgs = {
  userId: string;
  serverId: string;
  voiceChannel: Discord.VoiceChannel;
};

class PlayGreetingSoundCommandHandler
  implements ICommandHandler<VoiceStateUpdate> {
  activate({ oldVoiceState, newVoiceState }: VoiceStateUpdate) {
    return !oldVoiceState.channel && !!newVoiceState.channel;
  }
  parseCommand({
    newVoiceState,
  }: VoiceStateUpdate): PlayGreetingSoundCommandHandlerArgs | null {
    const serverId = newVoiceState.guild.id;
    const userId = newVoiceState.member?.id;
    const voiceChannel = newVoiceState.channel;

    if (!serverId || !userId || !voiceChannel) return null;

    return {
      userId,
      serverId,
      voiceChannel,
    };
  }
  async handleCommand(command: VoiceStateUpdate) {
    const params = this.parseCommand(command);

    if (!params) return;

    const serverSettings = await getSettings(params.serverId);

    if (!serverSettings || !serverSettings.greetings[params.userId]) return;

    const userGreetingSoundName = serverSettings.greetings[params.userId];
    const soundFilePath = `${soundsDirPath}/${params.serverId}/${userGreetingSoundName}.mp3`;

    if (!fs.existsSync(soundFilePath)) return;

    const conn = await params.voiceChannel.join();

    conn.play(soundFilePath).on("finish", () => {
      resetVoiceChannelTimer(params.voiceChannel);
    });
  }
}

export default PlayGreetingSoundCommandHandler;
