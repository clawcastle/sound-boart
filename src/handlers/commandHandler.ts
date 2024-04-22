import { Command } from "../command";

interface ICommandHandler<T> {
  activate: (command: Command<T>) => boolean;
  parseCommandPayload: (command: Command<T>) => any;
  handleCommand: (command: Command<T>) => Promise<void>;
}

export default ICommandHandler;
