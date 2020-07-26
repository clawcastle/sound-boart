const config = {
  prefix: "!sbt",
  botToken: process.env.BOT_TOKEN,
  storageAccountName: process.env.STORAGE_ACCOUNT_NAME,
  storageAccessKey: process.env.STORAGE_ACCESS_KEY,
  googleDrive: {
    clientEmail: process.env.GDRIVE_CLIENT_EMAIL,
    privateKey: process.env.GDRIVE_PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/documents",
    ],
    suggestionDocumentId: process.env.SUGGESTION_DOC_ID,
  },
  supportedFileFormats: [".mp3"],
  customizableSettingsValues: [
    {
      key: "leaveChannelTimeout",
      rule: (val) =>
        parseInt(val, 10) !== NaN &&
        parseInt(val, 10) <= 3600 &&
        parseInt(val, 10) >= 300,
    },
    { key: "prefix", rule: (val) => !!val },
  ],
  commands: [
    {
      name: "aoe",
      aliases: [],
      description:
        "Plays taunt sounds from aoe 2. Use like this: !s aoe {number}",
    },
    {
      name: "custom",
      aliases: ["c"],
      description:
        "Plays any custom sounds that have been uploaded in this Discord server. Use like this: !s custom {sound name}",
    },
    {
      name: "list",
      aliases: ["l"],
      description:
        "Lists available sounds for a given command. Use like this: !s list {sound category name}. For a list for all categories: !s list all",
    },
    {
      name: "upload",
      aliases: ["up"],
      description:
        "Uploads an attached mp3 file, so the bot can play it in the channel. Use like this: !s upload {name}, where name is the name you would like to write to play the sound",
    },
    {
      name: "help",
      aliases: ["h"],
      description:
        "Lists descriptions of available commands. Use like this: !s help",
    },
    {
      name: "delete",
      aliases: ["d"],
      description: "Deletes a command with the provided name, if it exists",
    },
    {
      name: "tag",
      aliases: ["t"],
      description:
        "Tags a command with a category. Use like this: !s tag {soundName} {categoryName}, where soundName is the sound you want to tag, and categoryName is the name of the category you want to tag the sound with",
    },
    {
      name: "aliases",
      aliases: ["al"],
      description: "Lists the shorthand aliases for commands",
    },
    {
      name: "random",
      aliases: ["rnd"],
      description:
        "Plays a random sound within the requested category. Use like this: !s random {categoryName}, where categoryName is the category you want to play a sound from.",
    },
    {
      name: "rename",
      aliases: ["re"],
      description:
        "Renames a category. Use like this: !s rename {oldCategoryName} {newCategoryName}, where oldCategoryName is the current name of the category, and newCategoryName is what you want to rename it.",
    },
    {
      name: "suggest",
      aliases: ["su"],
      description:
        "Posts a suggestion to the Google Docs document at this link: https://docs.google.com/document/d/1oOuKvgrgXGqrRyV_eA39ba5w7lpWt77tc2sv4sZkyk0/edit \n Use like this: !s suggest {your suggestion here}",
    },
  ],
};

exports.config = config;
