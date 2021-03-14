import EventEmitter from "node:events";
import Discord from "discord.js";
import ICommandHandler from "./handlers/commandHandler";
import { SoundBoartEvent } from "./soundBoartEvents";

class SoundBoartEventEmitter extends EventEmitter {
  register(event: SoundBoartEvent, handler: ICommandHandler) {
    event.aliases.forEach((eventAlias) => {
      this.on(eventAlias, async (message: Discord.Message) => {
        if (handler.activate(message)) {
          await handler.handleCommand(message);
        }
      });
    });
  }
}

export default SoundBoartEventEmitter;
