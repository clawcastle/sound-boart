const {
  tagSound,
  removeCategory,
  fetchServerConfig,
  saveServerConfig,
} = require("./azureStorage.js");

exports.assignSoundToCategory = async (serverId, soundName, categoryName) => {
  await tagSound(serverId, soundName, categoryName);
};

exports.deleteCategory = async (serverId, categoryName) => {
  await removeCategory(serverId, categoryName);
};

exports.renameCategory = async (
  serverId,
  categoryName,
  newCategoryName,
  onSuccess = () => {},
  onError = (e) => {
    console.log(e);
  }
) => {
  try {
    let serverConfig = await fetchServerConfig(serverId);
    const soundsInCategory = serverConfig.categories[categoryName];

    if (soundsInCategory) {
      delete serverConfig.categories[categoryName];
    }

    serverConfig.categories[newCategoryName] = soundsInCategory
      ? soundsInCategory
      : [];
    await saveServerConfig(serverId, serverConfig);
    onSuccess();
  } catch (err) {
    onError(err);
  }
};
