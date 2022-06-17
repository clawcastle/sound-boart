import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { listEvent } from "../soundBoartEvents.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";

type ListSoundsCommandHandlerParams = {
  serverId: string;
};

class ListSoundsCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return (
      commandParts.length > 0 && listEvent.aliases.includes(commandParts[0])
    );
  }

  parseCommand(
    command: Discord.Message
  ): ListSoundsCommandHandlerParams | null {
    const commandParts = getCommandParts(command.content);
    const serverId = command.guild?.id;

    if (!serverId) return null;

    return {
      serverId,
      ...(commandParts.length > 1 && { query: commandParts[1] }),
    };
  }

  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sounds",
        command.channel as Discord.TextChannel
      );
      return;
    }

    const soundNames = await getSoundNamesForServer(params.serverId);
    const messages = this.chunkMessage(soundNames);

    const textChannel = command.channel as Discord.TextChannel;
    messages.forEach((msg) => {
      if (msg.length > 0) {
        textChannel.send(msg);
      }
    });
  }

  private chunkMessage(soundNames: string[]) {
    const allSounds = soundNames.reduce(
      (a, b) => a + `, ${b.replace(".mp3", "")}`
    );

    return allSounds.match(/.{1,2000}/g) ?? [];
  }
}

export default ListSoundsCommandHandler;
