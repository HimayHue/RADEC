const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { removeTrackedClass, termCodeFromSemester } = require('../../utils/tracker');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('untrack')
      .setDescription('Stop tracking an ASU class')
      .addStringOption(option =>
         option.setName('semester')
            .setDescription('Choose the semester')
            .setRequired(true)
            .addChoices(
               { name: 'Summer 2025', value: 'summer' },
               { name: 'Fall 2025', value: 'fall' }
            ))
      .addIntegerOption(option =>
         option.setName('class_number')
            .setDescription('Enter the class number')
            .setRequired(true)),

   async execute(interaction) {
      const semester = interaction.options.getString('semester');
      const classNumber = interaction.options.getInteger('class_number');
      const termCode = termCodeFromSemester(semester);
      const userId = interaction.user.id;

      const removed = removeTrackedClass(userId, classNumber, termCode);

      if (removed) {
         await interaction.reply({ content: `❌ You are no longer tracking class ${classNumber} for ${semester} (${termCode}).`, flags: MessageFlags.Ephemeral });
      }
      else {
         await interaction.reply({ content: `⚠️ You weren't tracking that class.`, flags: MessageFlags.Ephemeral });
      }
   }
};
