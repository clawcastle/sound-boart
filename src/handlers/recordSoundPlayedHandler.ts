import ICommandHandler from "./commandHandler";
import { updateSoundPlayedMetrics } from "../usageMetrics/usageMetricsManager";

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
    const { serverId, userId, soundName } = this.parseCommand(command);

    await updateSoundPlayedMetrics(serverId, userId, soundName);
  }
}

export default RecordSoundPlayedCommandHandler;
