import fs from "fs";
const fsAsync = fs.promises;

export interface ITranscriptionService {
  transcribeFile(filePath: string): Promise<string>;
}

const requestUrl = "https://api.openai.com/v1/audio/transcriptions";

export class OpenAiWhisperTranscriptionService
  implements ITranscriptionService
{
  private _openAiApiKey: string;

  constructor(openAiApiKey: string) {
    this._openAiApiKey = openAiApiKey;
  }

  async transcribeFile(filePath: string): Promise<string> {
    if (!filePath.endsWith(".mp3")) {
      throw new Error("Only .mp3 files are supported");
    }

    const requestBody = new FormData();

    requestBody.append("model", "whisper-1");
    const fileContent = await fsAsync.readFile(filePath, "binary");
    requestBody.append("file", fileContent);

    const response = await fetch(requestUrl, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${this._openAiApiKey}`,
      },
      body: requestBody,
    });

    if (response.ok) {
      const result = await response.json();
      return result.text;
    } else {
      throw new Error(
        `Transcription request failed with status code ${response.status}`
      );
    }
  }
}
