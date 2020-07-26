const fs = require("fs");
const { resetVoiceChannelLeaveTimer } = require("./timer.js");
const { fetchSoundFile } = require("./azureStorage.js");

exports.playAoe = async (soundIndex, voiceChannel) => {
  const filePaths = fs.readdirSync("./sounds/aoe");
  if (soundIndex > filePaths.length || !voiceChannel) {
    return;
  }
  const fileToPlayPath = `./sounds/aoe/${filePaths[soundIndex]}`;

  await playSound(voiceChannel, fileToPlayPath);
};

exports.playCustom = async (serverId, voiceChannel, soundName) => {
  const filePath = `./sounds/custom/${serverId}/${soundName}.mp3`;
  const fileExistsLocally = fs.existsSync(filePath);

  if (!fileExistsLocally) {
    await fetchSoundFile(serverId, soundName);
  }
  await playSound(voiceChannel, `./sounds/custom/${serverId}/${soundName}.mp3`);
};

exports.playRandomSoundFromCategory = async (
  serverId,
  categoryName,
  voiceChannel,
  onSuccess = () => {},
  onError = () => {}
) => {
  const soundsInCategory = await getSoundsInCategory(serverId, categoryName);

  if (!soundsInCategory) {
    onError();
    return;
  }

  const index =
    Math.floor(Math.random() * soundsInCategory.length) %
    soundsInCategory.length;
  await this.playCustom(serverId, voiceChannel, soundsInCategory[index]);
};

const playSound = async (voiceChannel, filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  if (voiceChannel) {
    const conn = await voiceChannel.join();

    const dispatcher = conn.play(filePath);

    dispatcher.on("finish", (end) => {
      resetVoiceChannelLeaveTimer(voiceChannel);
    });
  }
};
