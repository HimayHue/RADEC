const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { addTrackedClass, termCodeFromSemester } = require('../../utils/tracker');


module.exports = {
   data: new SlashCommandBuilder()
      .setName('track')
      .setDescription('Track an ASU class availability')
      .addStringOption(option =>
         option.setName('semester')
            .setDescription('Choose the semester')
            .setRequired(true)
            .addChoices(
               // { name: 'Spring', value: 'spring' },
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

      const added = addTrackedClass(userId, classNumber, termCode);

      if (added) {
         await interaction.user.send(`✅ Now tracking class ${classNumber} for ${semester} (${termCode}). You'll get a DM if a seat opens.`);
         await interaction.reply({ content: 'Tracking started! Check your DMs.', flags: MessageFlags.Ephemeral });
      }
      else {
         await interaction.reply({ content: '⚠️ You are already tracking that class.', flags: MessageFlags.Ephemeral });
      }
   }
};
