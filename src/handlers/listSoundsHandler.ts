import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { listEvent } from "../soundBoartEvents.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSoundNamesForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type ListSoundsCommandHandlerParams = {
  serverId: string;
};

class ListSoundsCommandHandler implements ICommandHandler<Discord.Message> {
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return (
      commandParts.length > 0 && listEvent.aliases.includes(commandParts[0])
    );
  }

  parseCommandPayload({
    content,
    guild,
  }: Discord.Message): ListSoundsCommandHandlerParams | null {
    const commandParts = getCommandParts(content);
    const serverId = guild?.id;

    if (!serverId) return null;

    return {
      serverId,
      ...(commandParts.length > 1 && { query: commandParts[1] }),
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list your sounds",
        payload.channel as Discord.TextChannel
      );
      return;
    }

    const soundNames = await getSoundNamesForServer(params.serverId);
    const messages = this.chunkMessage(soundNames);

    const textChannel = payload.channel as Discord.TextChannel;
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
