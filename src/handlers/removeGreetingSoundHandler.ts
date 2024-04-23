import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import {
  getSettings,
  updateSettings,
} from "../serverSettings/settingsManager.js";
import ServerSettings from "../serverSettings/serverSettings.js";
import { Command } from "../command.js";

type RemoveGreetingSoundCommandHandlerArgs = {
  serverId: string;
  userId: string;
};

class RemoveGreetingSoundCommandHandler
  implements ICommandHandler<Discord.Message>
{
  activate(command: Command<Discord.Message>) {
    return command.context.commandParts.length > 0;
  }
  parseCommandPayload(command: Command<Discord.Message>): RemoveGreetingSoundCommandHandlerArgs | null {
    const serverId = command.context.serverId;
    const userId = command.payload.member?.id;

    if (!serverId || !userId) return null;

    return {
      serverId,
      userId,
    };
  }
  async handleCommand(command: Command<Discord.Message>) {
    const params = this.parseCommandPayload(command);
    const textChannel = command.payload.channel as Discord.TextChannel;

    if (!params) {
      sendMessage(
        "Something went wrong while trying to remove your greeting sound.",
        textChannel
      );
      return;
    }

    const settings = await getSettings(params.serverId);

    if (!settings?.greetings || !settings.greetings[params.userId]) {
      sendMessage("Could not find any greeting sound to remove.", textChannel);
      return;
    }

    const { [params.userId]: greetingSoundToRemove, ...restGreetings } =
      settings.greetings;

    const updatedSettings: ServerSettings = {
      ...settings,
      greetings: restGreetings,
    };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage("Greeting sound successfully removed.", textChannel);
  }
}

export default RemoveGreetingSoundCommandHandler;
