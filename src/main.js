const express = require("express");
const Discord = require("discord.js");
const {
  playAoe,
  playCustom,
  playRandomSoundFromCategory,
} = require("./play.js");
const { upload } = require("./upload.js");
const { list } = require("./list.js");
const { deleteItem } = require("./delete.js");
const { config } = require("./config.js");
const { assignSoundToCategory, renameCategory } = require("./categories.js");
const { makeSuggestion } = require("./suggest.js");

const app = express();
const client = new Discord.Client();
const { prefix } = config;

const getMessageHandlers = (serverId, textChannel, voiceChannel) => ({
  aoe: async (messageContent) => {
    const soundIndex = parseInt(messageContent.params[0], 10) - 1;
    await playAoe(soundIndex, voiceChannel);
  },
  custom: async (messageContent) => {
    await playCustom(serverId, voiceChannel, messageContent.params[0]);
  },
  upload: async (messageContent) => {
    const attachment = messageContent.originalMessage.attachments
      ? messageContent.originalMessage.attachments.first()
      : null;
    await upload(
      attachment,
      serverId,
      messageContent.params[0],
      () => {
        textChannel.send(
          `Taunt uploaded successfully! Type '!tnt custom ${messageContent.params[0]}' to play it.`
        );
      },
      (err) => {
        console.log(err);
        textChannel.send("Something went wrong while uploading your file.");
      }
    );
  },
  list: async (messageContent) => {
    await list(messageContent.params[0], serverId, textChannel);
  },
  help: () => {
    const helpString = config.commands
      .map((c) => `${c.name}${", " + c.aliases.join(", ")}: ${c.description}`)
      .join("\n");
    textChannel.send(helpString);
  },
  aliases: () => {
    const aliasesString = config.commands.map(
      (c) => `${c.name}: ${c.aliases.join(" ")} \n`
    );
    textChannel.send(aliasesString);
  },
  delete: async (messageContent) => {
    const deleteCommand = messageContent.params[0];
    const nameOfItemToDelete = messageContent.params[1];
    await deleteItem(serverId, deleteCommand, nameOfItemToDelete, () => {
      textChannel.send("Item successfully deleted.");
    });
  },
  tag: async (messageContent) => {
    const soundName = messageContent.params[0];
    const categoryName = messageContent.params[1];
    await assignSoundToCategory(serverId, soundName, categoryName);
    textChannel.send(
      `Sound successfully tagged with category: ${categoryName}.`
    );
  },
  random: async (messageContent) => {
    const categoryName = messageContent.params[0];
    await playRandomSoundFromCategory(
      serverId,
      categoryName,
      voiceChannel,
      () => {},
      () => {
        textChannel.send("No category found with the requested name.");
      }
    );
  },
  rename: async (messageContent) => {
    const categoryName = messageContent.params[0];
    const newCategoryName = messageContent.params[1];

    await renameCategory(
      serverId,
      categoryName,
      newCategoryName,
      () => {
        textChannel.send(
          `Category: ${categoryName} was renamed to ${newCategoryName}.`
        );
      },
      (e) => {
        console.log(e);
        textChannel.send(
          `Something went wrong while trying to rename category: ${categoryName}`
        );
      }
    );
  },
  settings: async (messageContent) => {},
  suggest: async (messageContent) => {
    const suggestionText = messageContent.params.join(" ");
    const suggestedBy = messageContent.originalMessage.author.username;

    await makeSuggestion(
      suggestionText,
      suggestedBy,
      () => {
        textChannel.send(
          `Suggestion saved successfully. View suggestions here: https://docs.google.com/document/d/1oOuKvgrgXGqrRyV_eA39ba5w7lpWt77tc2sv4sZkyk0/edit`
        );
      },
      (err) => {
        console.log(`Google drive error: ${err}`);
        textChannel.send(
          "Something went wrong while handling your suggestion."
        );
      }
    );
  },
});

const messageHandler = (message) => {
  if (!message.content.startsWith(prefix)) {
    return;
  }
  const serverId = message.guild.id;
  const textChannel = message.channel;
  const voiceChannel = message.member.voice.channel;

  const messageContent = transformMessageContent(message);

  const handlers = getMessageHandlers(serverId, textChannel, voiceChannel);

  try {
    const commandMatch = config.commands.some((c) => {
      if (
        c.name === messageContent.command ||
        c.aliases.includes(messageContent.command)
      ) {
        handlers[c.name](messageContent);
        return true;
      }
      return false;
    });

    if (!commandMatch) {
      textChannel.send(
        "Invalid command. Type '!tnt help' for a list of available commands."
      );
    }
  } catch (err) {
    console.log(err);
    textChannel.send("An unexpected error occured.");
  }
};

const transformMessageContent = (message) => {
  const content = message.content.split(" ");
  let messageContent = {
    originalMessage: message,
    prefix: content.length > 0 ? content[0] : "",
    command: content.length > 1 ? content[1] : "",
    params: content.length > 2 ? content.slice(2) : [],
  };

  if (
    !messageContent.params ||
    (messageContent.params.length <= 0 && messageContent.command !== "help")
  ) {
    messageContent.params = [messageContent.command];
    messageContent.command = "custom";
  }

  return messageContent;
};

client.on("message", (message) => {
  messageHandler(message);
});

client.login(config.botToken);

app.listen(8000, () => {
  console.log("Listening on port 8000!");
});
