const { SlashCommandBuilder } = require('discord.js');

module.exports = {

   data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!'),
   async execute(interaction) {
      await interaction.reply('Pong!');
      console.log(`/Ping command executed by ${interaction.user.tag} in ${interaction.guild.name} at ${new Date().toLocaleString()}`);
   },
};