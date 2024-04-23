import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
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
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 1;
  }

  parseCommandPayload(command: Command<Discord.Message>): SetGreetingSoundCommandHandlerArgs | null {
    const {serverId, commandParts} = command.context;
    const soundName = commandParts[1];

    const userId = command.payload.member?.id;

    if (!soundName || !serverId || !userId) return null;

    return {
      serverId,
      userId,
      soundName,
    };
  }

  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

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
