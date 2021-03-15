import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import { listEvent } from "../soundBoartEvents";
import fs from "fs";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";

type PlaySoundCommandHandlerArgs = {
  serverId: string;
  soundName: string;
};

class PlaySoundCommandHandler implements ICommandHandler {
  activate(_: Discord.Message) {
    return true;
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params) return;

    const soundFilePath = `${soundsDirPath}/${params.serverId}/${params.soundName}`;
    if (!fs.existsSync(soundFilePath)) {
      sendMessage(
        "Sound does not exist.",
        command.channel as Discord.TextChannel
      );
    }

    const voiceChannel = command.member?.voice?.channel;
    if (!voiceChannel) return;

    const conn = await voiceChannel.join();

    const dispatcher = conn.play(soundFilePath);

    dispatcher.on("finish", () => {
      //reset timer here when implemented
    });
  }

  parseCommand(command: Discord.Message): PlaySoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    if (commandParts.length === 0 || !command.guild?.id) return null;

    return {
      serverId: command.guild.id,
      soundName: commandParts[0],
    };
  }
}

export default PlaySoundCommandHandler;
