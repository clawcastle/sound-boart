const {
  fetchServerConfig,
  saveServerConfig,
  getSoundNames,
} = require("./azureStorage.js");
const { playCustom } = require("./play.js");

exports.setGreeting = async (userId, serverId, greetingSoundName) => {
  const serverConfig = await fetchServerConfig(serverId);

  const serverSoundsStrings = await getSoundNames(serverId);
  const serverSounds = serverSoundsStrings
    .flatMap((s) => s.split(","))
    .map((s) => s.trim());

  if (!serverSounds.some((s) => s === greetingSoundName)) {
    throw new Error();
  }

  let serverUserCommands = serverConfig.userCommands
    ? serverConfig.userCommands
    : {};
  serverUserCommands[userId] = {
    ...serverUserCommands[userId],
    greet: greetingSoundName,
  };

  const updatedServerConfig = {
    ...serverConfig,
    userCommands: serverUserCommands,
  };

  await saveServerConfig(serverId, updatedServerConfig);
};

exports.playGreeting = async (userId, serverId, voiceChannel) => {
  const serverConfig = await fetchServerConfig(serverId);

  const { userCommands } = serverConfig;

  if (!userCommands || !userCommands[userId] || !userCommands[userId].greet) {
    return;
  }

  const { greet: greetingSoundName } = userCommands[userId];

  await playCustom(serverId, voiceChannel, greetingSoundName);
};
