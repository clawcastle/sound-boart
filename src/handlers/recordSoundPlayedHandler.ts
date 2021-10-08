import ICommandHandler from "./commandHandler";
import Discord from "discord.js";
import { sendMessage } from "../utils/textChannelHelpers";
import { getCommandParts } from "../utils/messageHelpers";
import { getSettings, updateSettings } from "../serverSettings/settingsManager";
import ServerSettings from "../serverSettings/serverSettings";

type RecordSoundPlayedCommandHandlerArgs = {
  serverId: string;
  userId: string;
  soundName: string;
};

class RecordSoundPlayedCommandHandler
  implements ICommandHandler<RecordSoundPlayedCommandHandlerArgs>
{
  activate(command: RecordSoundPlayedCommandHandlerArgs) {
    return true;
  }
  parseCommand(command: RecordSoundPlayedCommandHandlerArgs) {
    return command;
  }
  async handleCommand(command: RecordSoundPlayedCommandHandlerArgs) {
    const params = this.parseCommand(command);
  }
}
