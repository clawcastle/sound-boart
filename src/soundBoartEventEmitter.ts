import EventEmitter from "events";
import ICommandHandler from "./handlers/commandHandler";
import { SoundBoartEvent } from "./soundBoartEvents";

class SoundBoartEventEmitter extends EventEmitter {
  registerHandler<T>(event: SoundBoartEvent, handler: ICommandHandler<T>) {
    event.aliases.forEach((eventAlias) => {
      this.on(eventAlias, async (message: T) => {
        if (handler.activate(message)) {
          await handler.handleCommand(message);
        }
      });
    });
  }
}

export const soundBoartEventEmitter = new SoundBoartEventEmitter();
