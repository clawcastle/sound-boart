import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import { Command } from "../command.js";

type SetGreetingSoundCommandHandlerArgs = {
  serverId: string;
  userId: string;
  soundName: string;
};

class SetGreetingSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 1;
  }

  parseCommandPayload({
    content,
    guild,
    member,
  }: Discord.Message): SetGreetingSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(content);
    const soundName = commandParts[1];

    const serverId = guild?.id;
    const userId = member?.id;

    if (!soundName || !serverId || !userId) return null;

    return {
      serverId,
      userId,
      soundName,
    };
  }

  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to set your greeting sound.",
        textChannel
      );
      return;
    }

    const settings = await getSettings(params.serverId);

    if (!settings || !settings.greetings) {
      sendMessage(
        "Something went wrong while trying to set your greeting sound.",
        textChannel
      );
      return;
    }

    const updatedSettings = {
      ...settings,
      greetings: {
        ...settings.greetings,
        [params.userId]: params.soundName,
      },
    };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage(
      `Greeting sound has been set to ${params.soundName}.`,
      textChannel
    );
  }
}

export default SetGreetingSoundCommandHandler;
