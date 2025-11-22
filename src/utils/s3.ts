// The format of sound object keys in S3 is /sounds/<server-id>/<sound-name>

const soundObjectKeyPattern = new RegExp(
  /\/sounds\/(?<serverId>\d+)\/(?<soundName>[^\/]+)/
);

export class SoundObjectKey {
  serverId: string;
  soundName: string;

  constructor(serverId: string, soundName: string) {
    this.serverId = serverId;
    this.soundName = soundName;
  }

  serialize(): string {
    return `/sounds/${this.serverId}/${this.soundName}`;
  }

  static deserialize(objectKey: string): SoundObjectKey | null {
    const match = objectKey.match(soundObjectKeyPattern);

    if (match) {
      const { serverId, soundName } = match.groups as {
        serverId: string;
        soundName: string;
      };
      return new SoundObjectKey(serverId, soundName);
    } else {
      console.log(
        `soundObjectKey='${objectKey}' did not match the expected pattern`
      );

      return null;
    }
  }
}
