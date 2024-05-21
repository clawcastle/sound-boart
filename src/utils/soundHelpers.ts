import fs from "fs";
const fsAsync = fs.promises;
import { soundboartConfig } from "../config.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { tracer } from "../tracing/tracer.js";
import { Paths, fileOrDirectoryExists } from "./fsHelpers.js";

export function playSound(
  soundFilePath: string,
  voiceChannel: VoiceBasedChannel
) {
  return new Promise<void>((resolve, reject) => {
    const span = tracer.startSpan("play-sound");

    const { id: channelId, guildId: serverId } = voiceChannel;

    let voiceConnection = getVoiceConnection(serverId);

    if (
      !voiceConnection ||
      voiceConnection.joinConfig.channelId !== channelId
    ) {
      voiceConnection = joinVoiceChannel({
        channelId,
        guildId: serverId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
    }

    const audioPlayer = createAudioPlayer();
    const audioResource = createAudioResource(soundFilePath);

    const subscription = voiceConnection.subscribe(audioPlayer);

    audioPlayer.play(audioResource);

    audioPlayer.on("error", (e) => {
      console.log("An error occurred while playing sound.", e);

      span.end();
      reject();
    });

    audioPlayer.on(AudioPlayerStatus.Idle, (_) => {
      subscription?.unsubscribe();

      span.end();
      resolve();
    });
  });
}

export async function getSoundNamesForServer(serverId: string) {
  const soundsDirectory = Paths.soundFilesDirectory(serverId);

  const serverSoundsDirectoryExists = await fileOrDirectoryExists(
    soundsDirectory
  );

  if (!serverSoundsDirectoryExists) {
    return [];
  }
  const soundNames = await fsAsync.readdir(soundsDirectory);

  return soundNames.map((name) => name.replace(".mp3", ""));
}

export async function getSoundNamesWithTagForServer(
  serverId: string,
  tagName: string
) {
  const serverSettings = await getSettings(serverId);

  if (!serverSettings.tags[tagName]) {
    return [];
  }

  const soundNames = serverSettings.tags[tagName];

  return soundNames;
}

export async function getClosestSoundNames(
  soundName: string,
  serverId: string,
  maxResults: number = 5,
  threshold: number = 5
) {
  const span = tracer.startSpan("find-closest-sound-names");

  const soundNames = await getSoundNamesForServer(serverId);

  span.setAttribute("sound-names.amount", soundNames.length);

  if (!soundNames || soundNames.length === 0) {
    span.end();
    return [];
  }

  const actualThreshold = Math.min(soundName.length - 1, threshold);

  const buckets: { [distance: number]: string[] } = {};

  for (let i = 0; i <= actualThreshold; i++) {
    buckets[i] = [];
  }

  const soundNameCharCounts: { [char: string]: number } = {};

  for (let i = 0; i < soundName.length; i++) {
    const char = soundName[i];

    if (!soundNameCharCounts[char]) {
      soundNameCharCounts[char] = 0;
    }

    soundNameCharCounts[char] += 1;
  }

  const calculateDistance = levenshteinDistanceMemoized();

  soundNames.forEach((otherName) => {
    const distance = calculateDistance(soundName, otherName);

    if (distance <= actualThreshold) {
      buckets[distance].push(otherName);
    }
  });

  const closestNames: string[] = [];

  let i = 0;
  while (i <= actualThreshold && closestNames.length < maxResults) {
    for (let j = 0; j < buckets[i].length; j++) {
      closestNames.push(buckets[i][j]);

      if (closestNames.length >= maxResults) {
        break;
      }
    }

    i++;
  }

  span.end();

  return closestNames;
}

function levenshteinDistanceMemoized() {
  let matrix: number[][] = [];

  return (a: string, b: string) => {
    const n = a.length;
    const m = b.length;
    if (matrix.length <= n || matrix[0].length <= m) {
      matrix = createMatrix(n + 1, m + 1);
    }
    return levenshteinDistance(a, b, matrix);
  };
}

function levenshteinDistance(
  a: string,
  b: string,
  distance_matrix?: number[][]
) {
  const n = a.length;
  const m = b.length;

  const matrix = distance_matrix ?? createMatrix(n + 1, m + 1);

  if (n === 0) return m;
  if (m === 0) return n;

  for (let i = 0; i <= n; i++) {
    matrix[i][0] = i;
  }

  for (let i = 0; i <= m; i++) {
    matrix[0][i] = i;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const deletionCost = matrix[i - 1][j] + 1;
      const insertionCost = matrix[i][j - 1] + 1;
      const substitutionCost =
        matrix[i - 1][j - 1] + (b[j - 1] === a[i - 1] ? 0 : 1);

      matrix[i][j] = Math.min(deletionCost, insertionCost, substitutionCost);
    }
  }

  return matrix[n][m];
}

function createMatrix(nRows: number, nColumns: number): number[][] {
  const matrix: number[][] = [];

  for (let index = 0; index < nRows; index++) {
    const row = new Array<number>(nColumns);

    for (let index = 0; index < row.length; index++) {
      row[index] = 0;
    }
    matrix.push(row);
  }

  return matrix;
}
