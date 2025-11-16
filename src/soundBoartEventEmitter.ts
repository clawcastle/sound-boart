import EventEmitter from "events";
import { Command } from "./command.js";
import ICommandHandler from "./handlers/commandHandler.js";
import { SoundBoartEvent } from "./soundBoartEvents.js";
import { tracer } from "./tracing/tracer.js";

class SoundBoartEventEmitter {
  private _eventEmitter: EventEmitter;

  constructor() {
    this._eventEmitter = new EventEmitter();
  }

  registerHandler<T>(event: SoundBoartEvent, handler: ICommandHandler<T>) {
    event.aliases.forEach((eventAlias) => {
      this._eventEmitter.on(eventAlias, async (command: Command<T>) => {
        if (handler.activate(command)) {
          tracer.startActiveSpan(`command.${eventAlias}`, async (span) => {
            try {
              const commandWithTracing = command.withSpan(span);

              await handler.handleCommand(commandWithTracing);

              console.log(`Handled command with commandName='${eventAlias}'`);
            } catch (err) {
              //TODO: add proper logging
              console.error("An error occurred", err);
            } finally {
              span.end();
            }
          });
        }
      });
    });
  }

  emit<T>(eventAlias: string, command: Command<T>) {
    this._eventEmitter.emit(eventAlias, command);
  }
}

export const soundBoartEventEmitter = new SoundBoartEventEmitter();
