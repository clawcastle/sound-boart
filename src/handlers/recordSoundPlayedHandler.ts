import ICommandHandler from "./commandHandler.js";
import { updateSoundPlayedMetrics } from "../usageMetrics/usageMetricsManager.js";
import { Command } from "../command.js";

type RecordSoundPlayedCommandHandlerArgs = {
  serverId: string;
  userId: string;
  soundName: string;
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
    const { serverId, userId, soundName } = this.parseCommandPayload(command);

    await updateSoundPlayedMetrics(serverId, userId, soundName);
  }
}

export default RecordSoundPlayedCommandHandler;
