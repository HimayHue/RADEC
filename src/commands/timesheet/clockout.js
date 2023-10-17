/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { clockOut } = require('../../utils/timesheetFunctions');
require('dotenv').config();

// Define an object to store employee information

module.exports = {
    name: 'clockout',
    deleted: false,
    description: 'Clock Out',
    options: [
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const activeProject = interaction.options.getString('projectname');
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        let clockOutInfo = clockOut(username, new Date());
        if (clockOutInfo) {
            return interaction.editReply(`You have clocked out at ${clockOutInfo.clockedOutTime.toLocaleString()}. You worked ${clockOutInfo.hoursWorked} hours.`);
        }
        else {
            return interaction.editReply(`You are not clocked in.`);
        }

    }
};
