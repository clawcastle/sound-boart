import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { soundsDirPath } from "../config";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { resetVoiceChannelTimer } from "../utils/leaveChannelTimer";
import {
  playSound,
  getSoundNamesForServer,
  getSoundNamesWithTagForServer,
} from "../utils/soundHelpers";

type PlayRandomSoundCommandHandlerArgs = {
  serverId: string;
  tagName?: string;
};

class PlayRandomSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 0;
  }
  parseCommand(
    command: Discord.Message
  ): PlayRandomSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);

    const serverId = command.guild?.id;
    if (!serverId || commandParts.length === 0) return null;

    if (commandParts.length === 1) return { serverId };

    const tagName = commandParts[1];

    return {
      serverId,
      tagName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;
    const voiceChannel = command.member?.voice?.channel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to play a random sound",
        textChannel
      );
      return;
    }

    if (!voiceChannel) {
      sendMessage(
        "You need to be connected to a voice channel to play a sound.",
        textChannel
      );
      return;
    }

    const soundNames = params.tagName
      ? await getSoundNamesWithTagForServer(params.serverId, params.tagName)
      : await getSoundNamesForServer(params.serverId);

    if (!soundNames || soundNames.length === 0) {
      sendMessage(
        "Either no sounds exist on the server, or no sounds exist with the provided tag.",
        textChannel
      );
      return;
    }

    const index = Math.ceil(Math.random() * soundNames.length - 1);
    const soundToPlay = soundNames[index];

    const conn = await voiceChannel.join();

    await playSound(
      `${soundsDirPath}/${params.serverId}/${soundToPlay}.mp3`,
      conn
    );

    resetVoiceChannelTimer(voiceChannel);
  }
}

export default PlayRandomSoundCommandHandler;
