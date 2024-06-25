// The format of sound object keys in S3 is /sounds/<server-id>/<sound-name>

const soundObjectKeyPattern = new RegExp(/\/sounds\/[^\/]+\/[^\/]+/);

export class SoundObjectKey {
  serverId: string;
  soundName: string;

  constructor(serverId: string, soundName: string) {
    this.serverId = serverId;
    this.soundName = soundName;
  }

  static deserialize(objectKey: string): SoundObjectKey | null {
    if (!soundObjectKeyPattern.test(objectKey)) return null;

    const [_, serverId, soundName] = objectKey.split("/");

    return new SoundObjectKey(serverId, soundName);
  }
}
