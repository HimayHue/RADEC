/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { clockIn } = require('../../utils/timesheetFunctions');
let { employeeInfo } = require('../../utils/timesheetFunctions');
require('dotenv').config();

// Define an object to store employee information

module.exports = {
    name: 'clockin',
    description: 'Timesheet Commands',
    options: [
        {
            name: 'projectname',
            description: 'Name of the active project',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();


        const activeProject = interaction.options.getString('projectname');
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        // if (username !== 'himay') {
        //     return interaction.editReply('You do not have permission to use this command.');
        // }

        console.log(`\nemployeeInfo: ${employeeInfo}`);
        console.log(`username: ${username}`);
        console.log(`usernameId: ${usernameId}`);
        console.log(`EmployeeInfo[username]: ${employeeInfo[username]}`);

        if (employeeInfo[username] != undefined) {
            if (employeeInfo[username].clockedInTime != undefined) {
                return interaction.editReply(`You are already clocked in at ${employeeInfo[username].clockedInTime.toLocaleString()}`);
            }
        }
        else {
            clockIn(username, new Date());
            return interaction.editReply(`You have clocked in at ${employeeInfo[username].clockedInTime.toLocaleString()}`);
        }
    }
};
