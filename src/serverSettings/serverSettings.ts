type ServerSettings = {
  tags: { [key: string]: string[] };
  greetings: { [userId: string]: string };
};

export const defaultSettings: ServerSettings = {
  tags: {},
  greetings: {},
};

export default ServerSettings;
