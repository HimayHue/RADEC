// connectionManager.js
const { joinVoiceChannel } = require('@discordjs/voice');

const connections = new Map(); // key: guildId, value: VoiceConnection

function connectToChannel(voiceChannel) {
   const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
   });

   connections.set(voiceChannel.guild.id, connection);
   return connection;
}

function getConnection(guildId) {
   return connections.get(guildId);
}

function destroyConnection(guildId) {
   const connection = connections.get(guildId);
   if (connection) {
      connection.destroy();
      connections.delete(guildId);
   }
}

module.exports = {
   connectToChannel,
   getConnection,
   destroyConnection,
};
