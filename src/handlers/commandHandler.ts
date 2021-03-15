import Discord from "discord.js";

interface ICommandHandler {
  activate: (command: Discord.Message) => boolean;
  parseCommand: (command: Discord.Message) => any;
  handleCommand: (command: Discord.Message) => Promise<void>;
}

export default ICommandHandler;
