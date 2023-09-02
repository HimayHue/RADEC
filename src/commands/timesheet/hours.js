const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');


module.exports = {
    name: 'hours',
    description: 'Hours Command',
    deleted: false,
  
    callback: async (client, interaction) => {
      await interaction.deferReply();
  
      const reply = await interaction.fetchReply();
  
  
      interaction.editReply(
        `Hours Command Works`
      );
    },
  };
  