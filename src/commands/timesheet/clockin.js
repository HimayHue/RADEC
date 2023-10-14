/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { clockIn } = require('../../utils/timesheetFunctions');
let { employeesInfo } = require('../../utils/timesheetFunctions');
require('dotenv').config();

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

        let clockedInTime = clockIn(username, usernameId, new Date());

        if (clockedInTime) {

            return interaction.editReply(`You have clocked in at ${clockedInTime.toLocaleString()}`);
        }
        else {

            console.log(`\nemployeeInfo: ${JSON.stringify(employeesInfo)}`);
            return interaction.editReply(`You are already clocked in at ${employeesInfo[username].clockedInTime.toLocaleString()}`);
        }

    }
};
