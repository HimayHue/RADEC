const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { trackCourse } = require('../../utils/tracker');


module.exports = {
   data: new SlashCommandBuilder()
      .setName('track')
      .setDescription('Track an ASU class availability')
      .addStringOption(option =>
         option.setName('semester')
            .setDescription('Choose the semester')
            .setRequired(true)
            .addChoices(
               { name: 'Fall 2025', value: '2257' },
               { name: 'Summer 2025', value: '2254' }
            ))
      .addStringOption(option =>
         option.setName('course')
            .setDescription('ie. CSE 472')
            .setRequired(true)
      )
      .addStringOption(option =>
         option.setName('course_title')
            .setDescription('ie. Social Media Mining')
            .setRequired(true)
      )
      .addIntegerOption(option =>
         option.setName('course_number')
            .setDescription('ie, 45786')
            .setRequired(true)),
   async execute(interaction) {
      const userId = interaction.user.id;
      const termCode = interaction.options.getString('semester');
      const course = interaction.options.getString('course');
      const courseTitle = interaction.options.getString('course_title');
      const courseNumber = interaction.options.getInteger('course_number');

      function getSemesterName(termCode) {
         const map = {
            '2254': 'Summer 2025',
            '2257': 'Fall 2025',
         };
         return map[termCode] || 'Unknown Semester';
      }


      const courseTrackedSuccessfully = trackCourse(userId, termCode, course, courseTitle, courseNumber);

      if (courseTrackedSuccessfully) {
         await interaction.user.send(`✅ Now tracking class ${course} ${courseTitle} ${courseNumber} for ${getSemesterName(termCode)}. You'll get a DM if a seat opens.`);
         await interaction.reply({ content: 'Tracking started! Check your DMs.', flags: MessageFlags.Ephemeral });
      }
      else {
         await interaction.reply({ content: '⚠️ You are already tracking that class.', flags: MessageFlags.Ephemeral });
      }
   }
};
