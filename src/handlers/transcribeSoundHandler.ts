import { Command } from "../command";
import { ITranscriptionService } from "../transcription/transcriptionService";
import { fileOrDirectoryExists, Paths } from "../utils/fsHelpers";
import ICommandHandler from "./commandHandler";

type TranscribeSoundCommand = {
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

    const transcription = await this._transcriptionService.transcribeFile(
      soundFilePath
    );

    await this._transcriptionService.saveTranscription(
      serverId,
      soundName,
      transcription
    );

    console.log(
      `Saved the following transcription of sound '${soundName}' for server ${serverId}: '${transcription}'.`
    );
  }
}

export default TranscribeSoundHandler;
