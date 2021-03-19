import * as Discord from "discord.js";

interface ICommandHandler<T> {
  activate: (command: T) => boolean;
  parseCommand: (command: T) => any;
  handleCommand: (command: T) => Promise<void>;
}

export default ICommandHandler;
