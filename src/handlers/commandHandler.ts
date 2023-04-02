import { Command } from "../command";

interface ICommandHandler<T> {
  activate: (payload: T) => boolean;
  parseCommandPayload: (payload: T) => any;
  handleCommand: (command: Command<T>) => Promise<void>;
}

export default ICommandHandler;
