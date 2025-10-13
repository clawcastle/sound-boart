import ICommandHandler from "./commandHandler.js";
import { updateSoundPlayedMetrics } from "../usageMetrics/usageMetricsManager.js";
import { Command } from "../command.js";

export type RecordSoundPlayedCommandHandlerArgs = {
  serverId: string;
  userId: string;
  soundName: string;
  isRandomSound: boolean;
};

class RecordSoundPlayedCommandHandler
  implements ICommandHandler<RecordSoundPlayedCommandHandlerArgs>
{
  activate(_: Command<RecordSoundPlayedCommandHandlerArgs>) {
    return true;
  }

  parseCommandPayload(command: Command<RecordSoundPlayedCommandHandlerArgs>) {
    return command.payload;
  }

  async handleCommand(command: Command<RecordSoundPlayedCommandHandlerArgs>) {
    const { serverId, userId, soundName, isRandomSound } = this.parseCommandPayload(command);

    await updateSoundPlayedMetrics(serverId, userId, soundName, isRandomSound);
  }
}

export default RecordSoundPlayedCommandHandler;
