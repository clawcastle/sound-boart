import ICommandHandler from "./commandHandler.js";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers.js";
import { getCommandParts } from "../utils/messageHelpers.js";
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
  activate({ content }: Discord.Message) {
    const commandParts = getCommandParts(content);

    return commandParts.length > 0;
  }
  parseCommandPayload({
    guild,
    member,
  }: Discord.Message): RemoveGreetingSoundCommandHandlerArgs | null {
    const serverId = guild?.id;
    const userId = member?.id;

    if (!serverId || !userId) return null;

    return {
      serverId,
      userId,
    };
  }
  async handleCommand({ payload }: Command<Discord.Message>) {
    const params = this.parseCommandPayload(payload);
    const textChannel = payload.channel as Discord.TextChannel;

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
