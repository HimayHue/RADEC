module.exports = {
    name: 'test',
    description: 'Test Command',
    deleted: true,
  
    callback: async (client, interaction) => {
      await interaction.deferReply();
  
      const reply = await interaction.fetchReply();
  
  
      interaction.editReply(
        `Test Command Works`
      );
    },
  };
  