import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { listEvent } from "../soundBoartEvents.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type ListSoundsCommandHandlerParams = {
  serverId: string;
};

class ListSoundsCommandHandler implements ICommandHandler<Discord.Message> {
  activate(command: Command<Discord.Message>) {
    return (
      command.context.commandParts.length > 0 && listEvent.aliases.includes(command.context.commandParts[0])
    );
  }

  parseCommandPayload(command: Command<Discord.Message>): ListSoundsCommandHandlerParams | null {
    const {serverId, commandParts} = command.context;

    return {
      serverId,
      ...(commandParts.length > 1 && { query: commandParts[1] }),
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sounds",
        command.payload.channel as Discord.TextChannel
      );
      return;
    }

    const soundNames = await getSoundNamesForServer(params.serverId);
    const messages = this.chunkMessage(soundNames);

    const textChannel = command.payload.channel as Discord.TextChannel;
    messages.forEach((msg) => {
      if (msg.length > 0) {
        textChannel.send(msg);
      }
    });
  }

  private chunkMessage(soundNames: string[]) {
    if (soundNames.length === 0) {
      return [];
    }

    const allSounds = soundNames.reduce(
      (a, b) => a + `, ${b.replace(".mp3", "")}`
    );

    return allSounds.match(/.{1,2000}/g) ?? [];
  }
}

export default ListSoundsCommandHandler;
