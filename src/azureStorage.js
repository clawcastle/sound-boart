const fs = require("fs");
const { config } = require("./config.js");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const https = require("https");

const blobServiceClient = new BlobServiceClient(
  `https://${config.storageAccountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(
    config.storageAccountName,
    config.storageAccessKey
  )
);

const getSoundsContainer = () => blobServiceClient.getContainerClient("sounds");
const getSoundBlobClient = (serverId, soundName) =>
  getSoundsContainer().getBlockBlobClient(
    `custom/${serverId}/${soundName}.mp3`
  );
const getServerConfigContainer = () =>
  blobServiceClient.getContainerClient("serverconfig");
const getServerConfigBlobClient = (serverId) =>
  getServerConfigContainer().getBlockBlobClient(`${serverId}.json`);

exports.fetchSoundFile = async (
  serverId,
  soundName,
  onSuccess = () => {},
  onError = () => {}
) => {
  const serverSoundsPath = `./sounds/custom/${serverId}`;
  if (!fs.existsSync(serverSoundsPath)) {
    fs.mkdirSync(serverSoundsPath);
  }
  const blobClient = getSoundBlobClient(serverId, soundName);

  const exists = await blobClient.exists();
  if (!exists) {
    onError();
    return;
  }

  await new Promise(async (resolve, reject) => {
    const response = await blobClient.download(0);
    const writeStream = fs.createWriteStream(
      `${serverSoundsPath}/${soundName}.mp3`
    );
    response.readableStreamBody.pipe(writeStream).on("finish", () => {
      resolve();
    });
    handleResponse(response._response, onSuccess, onError);
  });
};

exports.deleteSoundFile = async (
  serverId,
  soundName,
  onSuccess = () => {},
  onError = () => {}
) => {
  const localFilePath = `./sounds/custom/${serverId}/${soundName}.mp3`;
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
  const blobClient = getSoundBlobClient(serverId, soundName);
  const exists = await blobClient.exists();
  if (exists) {
    const response = await blobClient.delete();

    handleResponse(response._response, onSuccess, onError);
  }
};

exports.uploadSound = (
  serverId,
  soundName,
  discordCdnFilePath,
  onSuccess = () => {},
  onError = (err) => {}
) => {
  const serverSoundsPath = `./sounds/custom/${serverId}`;
  if (!fs.existsSync(serverSoundsPath)) {
    fs.mkdirSync(serverSoundsPath);
  }
  const localFilePath = `./sounds/custom/${serverId}/${soundName}.mp3`;

  try {
    downloadFileFromDiscord(discordCdnFilePath, localFilePath, async () => {
      const blobClient = getSoundBlobClient(serverId, soundName);

      const response = await blobClient.uploadFile(
        `./sounds/custom/${serverId}/${soundName}.mp3`
      );

      handleResponse(response._response, onSuccess, onError);
    });
  } catch (err) {
    onError(err);
  }
};

exports.fetchServerConfig = async (
  serverId,
  onSuccess = () => {},
  onError = () => {}
) => {
  const localFilePath = `./serverconfig/${serverId}.json`;

  if (!fs.existsSync(localFilePath)) {
    const blobClient = getServerConfigBlobClient(serverId);
    const exists = await blobClient.exists();
    if (!exists) {
      return serverSettingsTemplate();
    }
    await new Promise(async (resolve, reject) => {
      const response = await blobClient.download(0);
      handleResponse(response._response, onSuccess, onError);

      const writeStream = fs.createWriteStream(localFilePath);

      response.readableStreamBody.pipe(writeStream).on("finish", () => {
        resolve();
      });
    });
  }

  return JSON.parse(fs.readFileSync(localFilePath));
};

exports.saveServerConfig = async (
  serverId,
  serverConfigJson,
  onSuccess = () => {},
  onError = () => {}
) => {
  const localFilePath = `./serverconfig/${serverId}.json`;

  fs.writeFileSync(localFilePath, JSON.stringify(serverConfigJson));

  const blobClient = getServerConfigBlobClient(serverId);
  const response = await blobClient.uploadFile(localFilePath);

  handleResponse(response._response, onSuccess, onError);
};

exports.getSoundNames = async (
  serverId,
  onSuccess = () => {},
  onError = () => {}
) => {
  const containerClient = getSoundsContainer();
  const prefix = `custom/${serverId}/`;
  let names = [];

  for await (const blob of containerClient.listBlobsFlat({
    prefix: prefix,
  })) {
    names.push(blob.name);
  }
  result = [];
  let current = "";
  names.forEach((name) => {
    if (current.length + name.length > 1900) {
      result.push(current);
      current = "";
    }
    const soundName = name.replace(prefix, "").replace(".mp3", "");
    current = current.length > 0 ? current.concat(`, ${soundName}`) : soundName;
  });
  result.push(current);
  return result;
};

exports.tagSound = async (
  serverId,
  soundName,
  categoryName,
  onSuccess = () => {},
  onError = () => {}
) => {
  let soundExists =
    fs.existsSync(`./sounds/custom/${serverId}/${soundName}.mp3`) ||
    getSoundBlobClient(serverId, soundName).exists;

  if (!soundExists) {
    onError();
    return;
  }

  let serverConfig = await this.fetchServerConfig(serverId, onSuccess, onError);

  if (!serverConfig.categories[categoryName]) {
    serverConfig.categories[categoryName] = [];
  }
  serverConfig.categories[categoryName].push(soundName);

  await this.saveServerConfig(serverId, serverConfig, onSuccess, onError);
};

exports.getSoundsInCategory = async (
  serverId,
  categoryName,
  onSuccess = () => {},
  onError = () => {}
) => {
  const serverConfig = await this.fetchServerConfig(
    serverId,
    onSuccess,
    onError
  );
  return serverConfig.categories[categoryName];
};

exports.getAllServerSoundCategories = async (
  serverId,
  onSuccess = () => {},
  onError = () => {}
) => {
  const serverConfig = await this.fetchServerConfig(
    serverId,
    onSuccess,
    onError
  );

  return serverConfig.categories;
};

exports.removeCategory = async (serverId, categoryName) => {
  let serverConfig = await this.fetchServerConfig(serverId);

  delete serverConfig[categoryName];

  await this.saveServerConfig(serverId, serverConfig);
};

const downloadFileFromDiscord = (discordCdnFilePath, destination, callBack) => {
  const writeStream = fs.createWriteStream(destination);
  const request = https.get(discordCdnFilePath, (res) => {
    res.pipe(writeStream);
    writeStream
      .on("finish", () => {
        writeStream.close(callBack);
      })
      .on("error", (err) => {
        console.log(err);
      });
  });
};

const handleResponse = (response, onSuccess, onError) => {
  if (isSuccessStatusCode(response.status)) {
    onSuccess();
  } else {
    onError();
  }
};

const serverSettingsTemplate = () => ({
  channelLeaveTimeout: 600,
  prefix: "!tnt",
  categories: {},
});

const isSuccessStatusCode = (statusCode) =>
  statusCode >= 200 && statusCode <= 299;
