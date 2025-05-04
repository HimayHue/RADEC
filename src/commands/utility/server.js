const { SlashCommandBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('server')
      .setDescription('Provides information about the server.'),
   async execute(interaction) {
      // interaction.guild is the object representing the Guild in which the command was run
      await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members. It was created on ${interaction.guild.createdAt}.`);
      console.log(`/Server command executed by ${interaction.user.tag} in ${interaction.guild.name} at ${new Date().toLocaleString()}`);
   },
};