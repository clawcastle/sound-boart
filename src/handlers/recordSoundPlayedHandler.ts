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
  activate(_: RecordSoundPlayedCommandHandlerArgs) {
    return true;
  }

  parseCommandPayload(payload: RecordSoundPlayedCommandHandlerArgs) {
    return payload;
  }

  async handleCommand({
    payload,
  }: Command<RecordSoundPlayedCommandHandlerArgs>) {
    const { serverId, userId, soundName } = this.parseCommandPayload(payload);

    await updateSoundPlayedMetrics(serverId, userId, soundName);
  }
}

export default RecordSoundPlayedCommandHandler;
