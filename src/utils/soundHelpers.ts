import fs from "fs";
const fsAsync = fs.promises;
import { soundsDirPath } from "../config.js";
import { getSettings } from "../serverSettings/settingsManager.js";
import {
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";

export function playSound(
  soundFilePath: string,
  voiceChannel: VoiceBasedChannel
) {
  return new Promise<void>((resolve, reject) => {
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
      reject();
    });

    audioPlayer.on(AudioPlayerStatus.Idle, (_) => {
      subscription?.unsubscribe();
      resolve();
    });
  });
}

export async function getSoundNamesForServer(serverId: string) {
  const soundsDirectory = `${soundsDirPath}/${serverId}`;
  if (!fs.existsSync(soundsDirectory)) {
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
  threshold: number = 6
) {
  const soundNames = await getSoundNamesForServer(serverId);

  if (!soundNames || soundNames.length === 0) return [];

  const buckets: { [diff: number]: string[] } = {};

  const soundNameCharCounts: { [char: string]: number } = {};

  for (let i = 0; i < soundName.length; i++) {
    const char = soundName[i];

    if (!soundNameCharCounts[char]) {
      soundNameCharCounts[char] = 0;
    }

    soundNameCharCounts[char] += 1;
  }

  const otherSoundNameCharCounts: { [char: string]: number } = {};
  let previousCounts: { [char: string]: number } = {};

  const computeSoundNameDistance = (otherName: string) => {
    let diff = 0;

    for (let i = 0; i < otherName.length; i++) {
      const char = otherName[i];

      if (!otherSoundNameCharCounts[char]) {
        otherSoundNameCharCounts[char] = 0;
      }

      if (i < soundName.length && soundName[i] !== otherName[i]) {
        diff += 1;
      }

      otherSoundNameCharCounts[char] += 1;
    }

    // All characters were in the same place as sound name to be compared with, so either this other name is a prefix of the sound name,
    // or it begins with the entirety of the sound name and then contains additional characters afterwards.
    const isPrefixOrContainsSoundName = diff === 0;
    if (isPrefixOrContainsSoundName) {
      return 0;
    }

    diff += Math.abs(soundName.length - otherName.length);

    Object.keys(soundNameCharCounts).forEach((char) => {
      const currentCharCount = otherSoundNameCharCounts[char] ?? 0;
      const previousCharCount = previousCounts[char] ?? 0;

      const count = currentCharCount - previousCharCount;

      diff += Math.abs(soundNameCharCounts[char] - count);
    });

    previousCounts = { ...otherSoundNameCharCounts };

    return diff;
  };

  soundNames.forEach((otherName) => {
    const diff = computeSoundNameDistance(otherName);

    if (diff <= threshold) {
      if (!buckets[diff]) {
        buckets[diff] = [];
      }

      buckets[diff].push(otherName);
    }
  });

  const closestNames: string[] = [];

  Object.keys(buckets)
    .map((key) => Number.parseInt(key, 10))
    .sort((a, b) => a - b)
    .forEach((diff) => {
      for (let i = 0; i < buckets[diff].length; i++) {
        if (closestNames.length >= maxResults) return;

        closestNames.push(buckets[diff][i]);
      }
    });

  return closestNames;
}
