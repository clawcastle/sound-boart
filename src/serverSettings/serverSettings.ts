type ServerSettings = {
  categories: { [key: string]: string[] };
};

export const defaultSettings: ServerSettings = {
  categories: {},
};

export default ServerSettings;
