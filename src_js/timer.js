const map = {};

exports.resetVoiceChannelLeaveTimer = (voiceChannel) => {
  const channelId = voiceChannel.id;

  if (map[channelId]) {
    clearTimeout(map[channelId]);
  }
  const handle = setTimeout(() => {
    voiceChannel.leave();
    delete map[channelId];
  }, 600000); //10 minutes

  map[channelId] = handle;
};
