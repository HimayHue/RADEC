const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { listTrackedClasses } = require('../../utils/tracker');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('myclasses')
      .setDescription('List all ASU classes you are tracking'),

   async execute(interaction) {
      const userId = interaction.user.id;
      const tracked = listTrackedClasses(userId);

      if (tracked.length === 0) {
         await interaction.reply({ content: '📭 You are not tracking any classes.', flags: MessageFlags.Ephemeral });
         return;
      }

      const summary = tracked.map(entry => `• Class ${entry.course} ${entry.courseTitle}`).join('\n');
      await interaction.reply({ content: `📘 You are tracking the following classes:\n${summary}`, flags: MessageFlags.Ephemeral });
   }
};