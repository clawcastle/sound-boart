type ServerSettings = {
  tags: { [key: string]: string[] };
};

export const defaultSettings: ServerSettings = {
  tags: {},
};

export default ServerSettings;
