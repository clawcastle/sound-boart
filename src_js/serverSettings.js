const { fetchServerConfig, saveServerConfig } = require("./azureStorage.js");
const {config} = require("./config.js");

exports.getServerConfig = async (serverId) => {
  return await fetchServerConfig(serverId);
};

exports.setServerConfigValue = (serverId, key, value, onSuccess = () => { }, onError = () => { }) => {
  const customizableSettingsValue = config.customizableSettingsValues.find(x => x.key == key);
  if(!customizableSettingsValue || !customizableSettingsValue.rule(value)) {
    onError();
    return;
  }

  let serverConfig = await fetchServerConfig(serverId);
  serverConfig[key] = value;

  await saveServerConfig(serverId, serverConfig);
};