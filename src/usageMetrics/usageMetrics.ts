export type SoundPlayedByUser = {
  soundName: string;
  timesPlayed: number;
};

export type SoundsPlayedForServer = {
  [userId: string]: SoundPlayedByUser[];
};

export type ServerUsageMetrics = {
  soundsPlayed: SoundPlayedByUser[];
};

export const defaultUsageMetrics: ServerUsageMetrics = { soundsPlayed: [] };
