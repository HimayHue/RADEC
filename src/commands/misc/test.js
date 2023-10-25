// import timesheetFunctions
const { getHours, test } = require('../../utils/timesheetFunctions');

module.exports = {
    name: 'test',
    description: 'Test Command',
    deleted: false,
  
    callback: async (client, interaction) => {
      await interaction.deferReply();
  
      const reply = await interaction.fetchReply();

      let testOutput = test();
  
      interaction.editReply(
        `Test Output: ${testOutput}`
      );
    },
  };
  