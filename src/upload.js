const { uploadSound } = require("./azureStorage.js");
const { config } = require("./config.js");

exports.upload = async (
  attachment,
  serverId,
  fileName,
  onSuccess = () => {},
  onError = () => {}
) => {
  if (attachment) {
    if (
      config.supportedFileFormats.some(
        (sf) => attachment.url.indexOf(sf) !== -1
      )
    ) {
      await uploadSound(serverId, fileName, attachment.url, onSuccess, onError);
    }
  }
};
