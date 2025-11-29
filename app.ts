import {
  Client as DiscordClient,
  Events,
  GatewayIntentBits,
  Message,
  Partials,
} from "discord.js";
import { soundBoartEventEmitter } from "./src/soundBoartEventEmitter.js";
import UploadSoundCommandHandler from "./src/handlers/uploadSoundHandler.js";
import ListSoundsCommandHandler from "./src/handlers/listSoundsHandler.js";
import PlaySoundCommandHandler from "./src/handlers/playSoundHandler.js";
import DeleteSoundCommandHandler from "./src/handlers/deleteSoundHandler.js";
import RenameSoundCommandHandler from "./src/handlers/renameSoundHandler.js";
import TagSoundCommandHandler from "./src/handlers/tagSoundHandler.js";
import ListTagsCommandHandler from "./src/handlers/listTagsHandler.js";
import DeleteTagCommandHandler from "./src/handlers/deleteTagHandler.js";
import ListSoundsWithTagCommandHandler from "./src/handlers/listSoundsWithTagHandler.js";
import RenameTagCommandHandler from "./src/handlers/renameTagHandler.js";
import {
  uploadEvent,
  listEvent,
  playEvent,
  deleteEvent,
  renameEvent,
  tagSoundEvent,
  listTagsEvent,
  deleteTagEvent,
  listSoundsWithTagEvent,
  renameTagEvent,
  setGreetingSoundEvent,
  playGreetingSoundEvent,
  removeGreetingSoundEvent,
  helpEvent,
  playRandomSoundEvent,
  searchEvent,
  soundPlayedEvent,
  listTopSoundsEvent,
  setPrefixEvent,
  publicEventAliases,
  uploadToS3Event,
  deleteFromS3Event,
  transcribeSoundEvent,
  historyEvent,
} from "./src/soundBoartEvents.js";
import { getCommandParts } from "./src/utils/messageHelpers.js";
import SetGreetSoundCommandHandler from "./src/handlers/setGreetingSoundHandler.js";
import PlayGreetingSoundCommandHandler from "./src/handlers/playGreetingSoundHandler.js";
import RemoveGreetingSoundCommandHandler from "./src/handlers/removeGreetingSoundHandler.js";
import HelpCommandHandler from "./src/handlers/helpHandler.js";
import PlayRandomSoundCommandHandler from "./src/handlers/playRandomSoundHandler.js";
import SearchCommandHandler from "./src/handlers/searchHandler.js";
import RecordSoundPlayedCommandHandler from "./src/handlers/recordSoundPlayedHandler.js";
import ListTopSoundsCommandHandler from "./src/handlers/listTopSoundsHandler.js";
import { soundboartConfig } from "./src/config.js";
import { tracingSdk } from "./src/tracing/tracing.js";
import SetPrefixCommandHandler from "./src/handlers/setPrefixHandler.js";
import { Command, CommandContext } from "./src/command.js";
import UploadToS3Handler from "./src/handlers/uploadToS3Handler.js";
import DeleteFromS3Handler from "./src/handlers/deleteFromS3Handler.js";
import { S3SynchronizationJob } from "./src/jobs/s3SynchronizationJob.js";
import { JobContext } from "./src/jobs/job.js";
import { OpenAiWhisperTranscriptionService } from "./src/transcription/transcriptionService.js";
import TranscribeSoundHandler from "./src/handlers/transcribeSoundHandler.js";
import { ListSoundHistoryHandler } from "./src/handlers/listSoundHistoryHandler.js";
import { getSettings } from "./src/serverSettings/settingsManager.js";
import { getVoiceConnection } from "@discordjs/voice";
import { clearVoiceChannelLeaveTimer } from "./src/utils/leaveChannelTimer.js";

tracingSdk().start();

const discordClient = new DiscordClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error("BOT_TOKEN was missing in environment variables.");
}

discordClient.once(Events.ClientReady, () => {
  console.log("Soundboart is ready.");
});

const uploadSoundHandler = new UploadSoundCommandHandler();
soundBoartEventEmitter.registerHandler(uploadEvent, uploadSoundHandler);

const listSoundsHandler = new ListSoundsCommandHandler();
soundBoartEventEmitter.registerHandler(listEvent, listSoundsHandler);

const playSoundHandler = new PlaySoundCommandHandler();
soundBoartEventEmitter.registerHandler(playEvent, playSoundHandler);

const deleteSoundHandler = new DeleteSoundCommandHandler();
soundBoartEventEmitter.registerHandler(deleteEvent, deleteSoundHandler);

const renameSoundHandler = new RenameSoundCommandHandler();
soundBoartEventEmitter.registerHandler(renameEvent, renameSoundHandler);

const tagSoundHandler = new TagSoundCommandHandler();
soundBoartEventEmitter.registerHandler(tagSoundEvent, tagSoundHandler);

const listTagsHandler = new ListTagsCommandHandler();
soundBoartEventEmitter.registerHandler(listTagsEvent, listTagsHandler);

const deleteTagHandler = new DeleteTagCommandHandler();
soundBoartEventEmitter.registerHandler(deleteTagEvent, deleteTagHandler);

const listSoundsWithTagHandler = new ListSoundsWithTagCommandHandler();
soundBoartEventEmitter.registerHandler(
  listSoundsWithTagEvent,
  listSoundsWithTagHandler
);

const renameTagHandler = new RenameTagCommandHandler();
soundBoartEventEmitter.registerHandler(renameTagEvent, renameTagHandler);

const setGreetSoundHandler = new SetGreetSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  setGreetingSoundEvent,
  setGreetSoundHandler
);

const playGreetingSoundHandler = new PlayGreetingSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  playGreetingSoundEvent,
  playGreetingSoundHandler
);

const removeGreetingSoundHandler = new RemoveGreetingSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  removeGreetingSoundEvent,
  removeGreetingSoundHandler
);

const helpCommandHandler = new HelpCommandHandler();
soundBoartEventEmitter.registerHandler(helpEvent, helpCommandHandler);

const playRandomSoundHandler = new PlayRandomSoundCommandHandler();
soundBoartEventEmitter.registerHandler(
  playRandomSoundEvent,
  playRandomSoundHandler
);

const searchHandler = new SearchCommandHandler();
soundBoartEventEmitter.registerHandler(searchEvent, searchHandler);

const recordSoundPlayedHandler = new RecordSoundPlayedCommandHandler();
soundBoartEventEmitter.registerHandler(
  soundPlayedEvent,
  recordSoundPlayedHandler
);

const listTopSoundsHandler = new ListTopSoundsCommandHandler();
soundBoartEventEmitter.registerHandler(
  listTopSoundsEvent,
  listTopSoundsHandler
);

const setPrefixHandler = new SetPrefixCommandHandler();
soundBoartEventEmitter.registerHandler(setPrefixEvent, setPrefixHandler);

const historyHandler = new ListSoundHistoryHandler();
soundBoartEventEmitter.registerHandler(historyEvent, historyHandler);

const jobContext = new JobContext();

if (soundboartConfig.s3Config) {
  const uploadToS3Handler = new UploadToS3Handler(soundboartConfig.s3Config);
  soundBoartEventEmitter.registerHandler(uploadToS3Event, uploadToS3Handler);

  const deleteFromS3Handler = new DeleteFromS3Handler(
    soundboartConfig.s3Config
  );

  soundBoartEventEmitter.registerHandler(
    deleteFromS3Event,
    deleteFromS3Handler
  );

  const s3SynchronizationJob = new S3SynchronizationJob(
    soundboartConfig.s3Config
  );

  jobContext.addJob(s3SynchronizationJob);
}

if (soundboartConfig.openAiConfig) {
  const transcriptionService = new OpenAiWhisperTranscriptionService(
    soundboartConfig.openAiConfig.apiKey
  );

  const transcribeSoundHandler = new TranscribeSoundHandler(
    transcriptionService
  );

  soundBoartEventEmitter.registerHandler(
    transcribeSoundEvent,
    transcribeSoundHandler
  );
}

await jobContext.runJobs();

const getPrefix = async (message: Message) => {
  if (!message.guild?.id) {
    return soundboartConfig.defaultPrefix;
  }

  const serverSettings = await getSettings(message.guild.id);

  return serverSettings?.prefix ?? soundboartConfig.defaultPrefix;
};

discordClient.on(Events.MessageCreate, async (message) => {
  const prefix = await getPrefix(message);

  if (!message.content.startsWith(prefix) || !message.guild?.id) return;

  const commandParts = getCommandParts(prefix, message.content);

  if (commandParts.length === 0) return;

  const commandContext: CommandContext = {
    prefix,
    commandParts,
    serverId: message.guild.id,
  };

  const eventAlias = commandParts[0];
  const command = new Command(message, commandContext);

  if (publicEventAliases.has(eventAlias)) {
    soundBoartEventEmitter.emit(eventAlias, command);
  } else {
    //There is no alias for play, so we just try and invoke it if no other aliases match
    soundBoartEventEmitter.emit("play", command);
  }
});

discordClient.on(Events.Error, (err) => {
  console.error(
    `[Source: Events.Error handler] Soundboart encountered an error that was not caught elsewhere in the application.`,
    err
  );
});

discordClient.on(Events.ShardError, (err) => {
  console.error(
    `[Source: Events.ShardError handler] Soundboart encountered an error that was not caught elsewhere in the application.`,
    err
  );
});

discordClient.on(
  Events.VoiceStateUpdate,
  async (oldVoiceState, newVoiceState) => {
    const serverId = newVoiceState.guild.id;

    const userDisconnectedFromChannel =
      oldVoiceState.channelId && !newVoiceState.channelId;
    const userConnectedToChannel =
      !oldVoiceState.channelId && newVoiceState.channelId;

    if (userConnectedToChannel) {
      const channel = oldVoiceState.channel;

      console.log(
        `User with userId='${oldVoiceState.member?.user.id}' disconnected from voice channel with channelId='${channel?.id}' in server with serverId='${channel?.guildId}'`
      );
      const settings = await getSettings(serverId);

      const commandContext: CommandContext = {
        prefix: settings?.prefix ?? soundboartConfig.defaultPrefix,
        commandParts: [],
        serverId,
      };

      const command = new Command(
        { oldVoiceState, newVoiceState },
        commandContext
      );

      soundBoartEventEmitter.emit("play-greet", command);
    } else if (userDisconnectedFromChannel) {
      const channel = oldVoiceState.channel;
      const userId = oldVoiceState.member?.user.id;

      if (channel) {
        const nonBotMembers = channel?.members.filter(
          (member) => !member.user.bot
        );

        console.log(
          `User with userId='${userId}' disconnected from voice channel with channelId='${channel.id}' in server with serverId='${channel.guildId}'`
        );
        // Voice channel is empty or only bots are left
        if (nonBotMembers?.size === 0) {
          const connection = getVoiceConnection(channel.guild.id);

          if (connection) {
            connection.destroy();
            clearVoiceChannelLeaveTimer(channel.guild.id);

            console.log(
              `Sound-boart channel with channelId='${channel.id}' in server with serverId='${channel.guildId}' after user with userId='${userId}' left the channel`
            );
          }
        } else {
          console.log(
            `User with userId='${userId}' left channel with channelId='${channel.id}' in server with serverId='${channel.guildId}'. There are still userCount=${nonBotMembers?.size} non-bot users left in channel, sound-boart is not leaving`
          );
        }
      } else {
        console.log(
          `Received VoiceStateUpdate that user with userId='${userId}' left a voice channel in server with serverId='${oldVoiceState.guild.id}' but channel was null`
        );
      }
    }
  }
);

const onProcessExit = () => {
  console.log("Soundboart shutting down.");

  discordClient.destroy();
};

process.addListener("SIGINT", onProcessExit);
process.addListener("SIGTERM", onProcessExit);

await discordClient.login(botToken);
