import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";

type SetGreetingSoundCommandHandlerArgs = {
  serverId: string;
  userId: string;
  soundName: string;
};

class SetGreetingSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 1;
  }
  parseCommand(
    command: Discord.Message
  ): SetGreetingSoundCommandHandlerArgs | null {
    const commandParts = getCommandParts(command.content);
    const soundName = commandParts[1];

    const serverId = command.guild?.id;
    const userId = command.member?.id;

    if (!soundName || !serverId || !userId) return null;

    return {
      serverId,
      userId,
      soundName,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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
