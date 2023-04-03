import EventEmitter from "events";
import { Command } from "./command.js";
import ICommandHandler from "./handlers/commandHandler.js";
import { SoundBoartEvent } from "./soundBoartEvents.js";
import { tracer } from "./tracing/tracer.js";

class SoundBoartEventEmitter extends EventEmitter {
  registerHandler<T>(event: SoundBoartEvent, handler: ICommandHandler<T>) {
    event.aliases.forEach((eventAlias) => {
      this.on(eventAlias, async (message: T) => {
        if (handler.activate(message)) {
          tracer.startActiveSpan(`command.${eventAlias}`, async (span) => {
            const command = new Command(message, span);

            try {
              await handler.handleCommand(command);
            } catch (err) {
              //TODO: add proper logging
              console.log("An error occurred", err);
            } finally {
              span.end();
            }
          });
        }
      });
    });
  }
}

export const soundBoartEventEmitter = new SoundBoartEventEmitter();
