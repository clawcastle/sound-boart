const fs = require("fs");
const {
  getSoundNames,
  getSoundsInCategory,
  getAllServerSoundCategories,
} = require("./azureStorage.js");
const baseDir = "./sounds";

exports.list = async (command, serverId, textChannel) => {
  switch (command) {
    case "c":
    case "custom":
      await listCustom(serverId, textChannel);
      break;
    case "aoe":
      listAoe(textChannel);
      break;
    case "all":
      listAoe(textChannel);
      await listCustom(serverId, textChannel);
      break;
    case "cat":
    case "categories":
      await listAllCategories(serverId, textChannel);
      break;
    default:
      await listCategory(serverId, command, textChannel);
      break;
  }
};

const listCustom = async (serverId, textChannel) => {
  const soundNamesChunked = await getSoundNames(serverId);
  soundNamesChunked.forEach((chunk) => {
    textChannel.send(chunk);
  });
};

const listAoe = (textChannel) => {
  listFolder("aoe", textChannel);
};

const listCategory = async (serverId, categoryName, textChannel) => {
  const soundsInCategory = await getSoundsInCategory(serverId, categoryName);
  if (soundsInCategory && soundsInCategory.length) {
    textChannel.send(
      `${categoryName}: ${soundsInCategory.reduce((a, b) => a + ", " + b)}`
    );
  } else {
    textChannel.send("No sounds in category.");
  }
};

const listAllCategories = async (serverId, textChannel) => {
  const categories = await getAllServerSoundCategories(serverId);

  const responseString = Object.keys(categories).join("\n");

  if (responseString.length) {
    textChannel.send(responseString);
  } else {
    textChannel.send("No categories configured for server.");
  }
};

const listFolder = (folderName, textChannel) => {
  const filePaths = fs.readdirSync(`${baseDir}/${folderName}`);

  const reply = filePaths.reduce((a, b) => a + ", " + b);
  textChannel.send(reply);
};

const findSoundFilesInFolderRecursive = (rootFolder) => {
  const items = fs.readdirSync(rootFolder);
  if (!items || items.length <= 0 || items[0].indexOf(".mp3") !== -1) {
    return items.map((item) => item.replace(".mp3", ""));
  }
  return items.map((f) =>
    findSoundFilesInFolderRecursive(`${rootFolder}/${f}`)
  );
};
