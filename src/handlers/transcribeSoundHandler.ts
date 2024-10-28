import { Command } from "../command.js";
import { ITranscriptionService } from "../transcription/transcriptionService.js";
import { fileOrDirectoryExists, Paths } from "../utils/fsHelpers.js";
import ICommandHandler from "./commandHandler.js";

export type TranscribeSoundCommand = {
  serverId: string;
  soundName: string;
};

class TranscribeSoundHandler
  implements ICommandHandler<TranscribeSoundCommand>
{
  private _transcriptionService: ITranscriptionService;

  constructor(transcriptionService: ITranscriptionService) {
    this._transcriptionService = transcriptionService;
  }

  activate(command: Command<TranscribeSoundCommand>): boolean {
    return true;
  }

  parseCommandPayload(
    command: Command<TranscribeSoundCommand>
  ): TranscribeSoundCommand | null {
    return command.payload;
  }

  async handleCommand(command: Command<TranscribeSoundCommand>): Promise<void> {
    const { serverId, soundName } = command.payload;

    const soundFilePath = Paths.soundFile(serverId, soundName);
    const soundExists = await fileOrDirectoryExists(soundFilePath);

    if (!soundExists) {
      console.log(
        `Received event to transcribe sound '${soundName}' for server ${serverId}, but sound file does not exist.`
      );
      return;
    }

    const transcription = await this._transcriptionService.transcribeSound(
      serverId,
      soundName
    );

    console.log(
      `Saved the following transcription of sound '${soundName}' for server ${serverId}: '${transcription}'.`
    );
  }
}

export default TranscribeSoundHandler;
