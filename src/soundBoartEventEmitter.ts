import EventEmitter from "events";
import ICommandHandler from "./handlers/commandHandler.js";
import { SoundBoartEvent } from "./soundBoartEvents.js";

class SoundBoartEventEmitter extends EventEmitter {
  registerHandler<T>(event: SoundBoartEvent, handler: ICommandHandler<T>) {
    event.aliases.forEach((eventAlias) => {
      this.on(eventAlias, async (message: T) => {
        if (handler.activate(message)) {
          try {
            await handler.handleCommand(message);
          } catch (err) {
            //TODO: add proper logging
            console.log("An error occurred", err);
          }
        }
      });
    });
  }
}

export const soundBoartEventEmitter = new SoundBoartEventEmitter();
