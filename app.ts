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
import { getSettings } from "./src/serverSettings/serverSettingsCache.js";
import { Command, CommandContext } from "./src/command.js";

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
  console.log("Soundboart is ready");
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

discordClient.on(
  Events.VoiceStateUpdate,
  async (oldVoiceState, newVoiceState) => {
    const serverId = newVoiceState.guild.id;

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
  }
);

const onProcessExit = () => {
  console.log("Soundboart shutting down.");

  discordClient.destroy();
};

process.addListener("SIGINT", onProcessExit);
process.addListener("SIGTERM", onProcessExit);

await discordClient.login(botToken);
