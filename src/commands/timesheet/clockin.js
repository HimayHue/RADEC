/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { clockIn } = require('../../utils/timesheetFunctions');
require('dotenv').config();

module.exports = {
    name: 'clockin',
    description: 'Timesheet Commands',
    options: [
        {
            name: 'now',
            description: 'clocks in the user',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        if (interaction.user.username != 'himay') {
            return interaction.editReply('You do not have permission to use this command.');
        }

        const activeProject = interaction.options.getString('projectname');
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        clockIn(username, new Date());
        interaction.editReply(`${username} clocked in at ${new Date().toLocaleString()}`);
    }
};
