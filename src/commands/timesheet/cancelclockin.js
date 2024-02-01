/* 
Created By: Himay
Creation Date: 1/24/2024
Last Edit Date: 1/24/2024
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { cancelClockIn } = require('../../utils/timesheetFunctions');
require('dotenv').config();

module.exports = {
   name: 'cancelclockin',
   description: 'Cancels clocked in sesssion',

   callback: async (client, interaction) => {
      await interaction.deferReply();

      console.log(`\nCANCEL CLOCK IN COMMAND`);

      // only allow users with Radec role to clock in
      const role = interaction.guild.roles.cache.find(role => role.name === "Radec");
      if (!interaction.member.roles.cache.has(role.id)) {
         return interaction.editReply(`You do not have permission to clock in.`);
      }

      const employeeID = interaction.user.id;
      const employeeName = interaction.user.username;

      let clockInWasCancelled = cancelClockIn(employeeID);

      if (clockInWasCancelled) {
         return interaction.editReply(`Cancelled clocked in sessions for ${employeeName}`)
      }
      else {
         return interaction.editReply(`${employeeName} is not clocked in`)
      }

   }
};
