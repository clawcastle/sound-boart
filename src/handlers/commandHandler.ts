import Discord from "discord.js";

interface ICommandHandler {
  activate: (command: Discord.Message) => boolean;
  handleCommand: (command: Discord.Message) => Promise<void>;
}

export default ICommandHandler;
