import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import { getSoundNamesWithTagForServer } from "../utils/soundHelpers.js";
import { Command } from "../command.js";

type ListSoundsWithTagCommandHandlerArgs = {
  serverId: string;
  tagName: string;
};

class ListSoundsWithTagCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }

  parseCommandPayload({
    content,
    guild,
  }: Discord.Message): ListSoundsWithTagCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);
    const tagName = commandParts[1];

    const serverId = guild?.id;

    if (!serverId || !tagName) return null;

    return {
      serverId,
      tagName,
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to list tags.",
        textChannel
      );
      return;
    }

    try {
      const soundNames = await getSoundNamesWithTagForServer(
        params.serverId,
        params.tagName
      );

      if (soundNames && soundNames.length > 0) {
        const soundNamesMessage = soundNames.join(", ");

        sendMessage(soundNamesMessage, textChannel);
      }
    } catch (error) {
      sendMessage(
        "Something went wrong while trying to list tags.",
        textChannel
      );
      return;
    }
  }
}

export default ListSoundsWithTagCommandHandler;
