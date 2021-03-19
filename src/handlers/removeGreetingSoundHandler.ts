import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings, updateSettings } from "../serverSettings/settingsManager";
import ServerSettings from "../serverSettings/serverSettings";

type RemoveGreetingSoundCommandHandlerArgs = {
  serverId: string;
  userId: string;
};

class RemoveGreetingSoundCommandHandler
  implements ICommandHandler<Discord.Message> {
  activate(command: Discord.Message) {
    const commandParts = getCommandParts(command.content);

    return commandParts.length > 0;
  }
  parseCommand(
    command: Discord.Message
  ): RemoveGreetingSoundCommandHandlerArgs | null {
    const serverId = command.guild?.id;
    const userId = command.member?.id;

    if (!serverId || !userId) return null;

    return {
      serverId,
      userId,
    };
  }
  async handleCommand(command: Discord.Message) {
    const params = this.parseCommand(command);
    const textChannel = command.channel as Discord.TextChannel;

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

    const {
      [params.userId]: greetingSoundToRemove,
      ...restGreetings
    } = settings.greetings;

    const updatedSettings: ServerSettings = {
      ...settings,
      greetings: restGreetings,
    };

    await updateSettings(params.serverId, updatedSettings);

    sendMessage("Greeting sound successfully removed.", textChannel);
  }
}

export default RemoveGreetingSoundCommandHandler;
