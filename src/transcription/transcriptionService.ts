import fs from "fs";
import { fileOrDirectoryExists, Paths } from "../utils/fsHelpers.js";
import { blobFrom } from "node-fetch";
const fsAsync = fs.promises;

export interface ITranscriptionService {
  transcribeSound(serverId: string, soundName: string): Promise<string>;

  buildWordsSpokenInSoundsIndex(
    serverId: string
  ): Promise<WordsSpokenInSoundsIndex>;
}

const requestUrl = "https://api.openai.com/v1/audio/transcriptions";

type SoundTranscription = {
  soundName: string;
  transcription: string;
};

class WordsSpokenInSoundsIndex {
  private _wordsToSoundNamesMap: Map<string, string[]> = new Map();

  soundsWhereWordIsSpoken(word: string): string[] {
    return this._wordsToSoundNamesMap.get(word) ?? [];
  }

  addWordsForSound(soundName: string, words: string[]) {
    words.forEach((word) => {
      const soundNames = this._wordsToSoundNamesMap.get(word) ?? [];

      soundNames.push(soundName);

      this._wordsToSoundNamesMap.set(word, soundNames);
    });
  }
}

export class OpenAiWhisperTranscriptionService
  implements ITranscriptionService
{
  private _openAiApiKey: string;

  constructor(openAiApiKey: string) {
    this._openAiApiKey = openAiApiKey;
  }

  async transcribeSound(serverId: string, soundName: string): Promise<string> {
    const filePath = Paths.soundFile(serverId, soundName);
    const transcription = await this.generateTranscription(filePath);

    await this.saveTranscription(serverId, soundName, transcription);

    return transcription;
  }

  private async generateTranscription(filePath: string): Promise<string> {
    if (!filePath.endsWith(".mp3")) {
      throw new Error("Only .mp3 files are supported");
    }

    const requestBody = new FormData();

    requestBody.append("model", "whisper-1");

    const fileContent = await blobFrom(filePath);
    requestBody.append("file", fileContent, filePath.split("/").pop());

    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${this._openAiApiKey}`,
      },
      body: requestBody,
      method: "POST",
    });

    if (response.ok) {
      const result = await response.json();
      return result.text;
    } else {
      const errorResponseBody = await response.text();

      throw new Error(
        `Transcription request failed with status code ${response.status} and message: ${errorResponseBody}`
      );
    }
  }

  private async saveTranscription(
    serverId: string,
    soundName: string,
    transcription: string
  ): Promise<void> {
    const directoryExists = await fileOrDirectoryExists(
      Paths.transcriptionsDirectory(serverId)
    );

    if (!directoryExists) {
      await fsAsync.mkdir(Paths.transcriptionsDirectory(serverId), {
        recursive: true,
      });
    }

    const transcriptionFilePath = Paths.transcriptionsFile(serverId, soundName);

    const transcriptionFileContent: SoundTranscription = {
      soundName,
      transcription,
    };

    await fsAsync.writeFile(
      transcriptionFilePath,
      JSON.stringify(transcriptionFileContent)
    );
  }

  async getTranscription(
    serverId: string,
    soundName: string
  ): Promise<SoundTranscription> {
    const soundFilePath = Paths.transcriptionsFile(serverId, soundName);
    const transcriptionFileContent = await fsAsync.readFile(
      soundFilePath,
      "utf-8"
    );

    const transcription = JSON.parse(
      transcriptionFileContent
    ) as SoundTranscription;

    return transcription;
  }

  async buildWordsSpokenInSoundsIndex(
    serverId: string
  ): Promise<WordsSpokenInSoundsIndex> {
    const index = new WordsSpokenInSoundsIndex();

    const transcriptionFiles = await fsAsync.readdir(
      Paths.transcriptionsDirectory(serverId)
    );

    transcriptionFiles.forEach(async (transcriptionFile) => {
      const soundTranscription = await this.getTranscription(
        serverId,
        transcriptionFile
      );

      const words = soundTranscription.transcription
        .split(" ")
        .filter((word) => word.length > 0);

      index.addWordsForSound(soundTranscription.soundName, words);
    });

    return index;
  }
}
