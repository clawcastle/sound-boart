import { tracingSdk } from "./src/tracing/tracing.js";
import {
  Client as DiscordClient,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { prefix } from "./src/config.js";
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
  events,
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
import opentelemetry from "@opentelemetry/api";

tracingSdk.start();

const eventAliasesSet = new Set<string>();

events.forEach((e) => {
  e.aliases.forEach((alias) => {
    eventAliasesSet.add(alias);
  });
});

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

discordClient.on(Events.MessageCreate, (message) => {
  if (!message.content.startsWith(prefix)) return;

  const messageParts = getCommandParts(message.content);
  if (messageParts.length === 0) return;

  //There is no alias for play, so we just try and invoke it if no other aliases match
  if (!eventAliasesSet.has(messageParts[0])) {
    soundBoartEventEmitter.emit("play", message);
    return;
  }

  soundBoartEventEmitter.emit(messageParts[0], message);
});

discordClient.on(Events.VoiceStateUpdate, (oldVoiceState, newVoiceState) => {
  soundBoartEventEmitter.emit("play-greet", { oldVoiceState, newVoiceState });
});

await discordClient.login(botToken);
