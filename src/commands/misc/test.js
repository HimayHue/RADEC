module.exports = {
    name: 'test',
    description: 'Test Command',
    deleted: false,
  
    callback: async (client, interaction) => {
      await interaction.deferReply();
  
      const reply = await interaction.fetchReply();
  
  
      interaction.editReply(
        `Test Command Works`
      );
    },
  };
  