const { SlashCommandBuilder } = require('discord.js');
const { destroyConnection, getConnection } = require('../../connectionManager');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leaves the voice channel'),

   async execute(interaction) {

      const isConnectedToVoice = getConnection(interaction.guild.id);
      if (isConnectedToVoice) {
         destroyConnection(interaction.guild.id);
         await interaction.reply('👋 Left the voice channel.');
      }
      else {
         await interaction.reply({ content: '❌ I am not connected to any voice channel.', ephemeral: true });
      }
   },
};
