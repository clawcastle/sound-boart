const { deleteSoundFile } = require("./azureStorage.js");
const { deleteCategory } = require("./categories");

exports.deleteItem = async (
  serverId,
  command,
  nameOfItemToDelete,
  onSuccess = () => {},
  onError = (e) => {
    console.log(e);
  }
) => {
  try {
    switch (command) {
      case "sound":
        await deleteSound(serverId, nameOfItemToDelete);
        onSuccess();
        break;
      case "category":
        await deleteSoundCategory(serverId, nameOfItemToDelete);
        onSuccess();
        break;
      default:
        break;
    }
  } catch (err) {
    onError(err);
  }
};

const deleteSound = async (
  serverId,
  soundName,
  onSuccess = () => {},
  onError = () => {}
) => {
  await deleteSoundFile(serverId, soundName, onSuccess, onError);
};

const deleteSoundCategory = async (serverId, categoryName) => {
  await deleteCategory(serverId, categoryName);
};
