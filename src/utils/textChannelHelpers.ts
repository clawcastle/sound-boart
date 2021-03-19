import * as Discord from "discord.js";

export function sendMessage(message: string, textChannel: Discord.TextChannel) {
  textChannel.send(message);
}
