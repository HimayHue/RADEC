/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { setActiveProject } = require('../../utils/timesheetFunctions');
let { employeesInfo } = require('../../utils/timesheetFunctions');

require('dotenv').config();

module.exports = {
    name: 'setproject',
    description: 'Set the active project',
    options: [
        {
            name: 'project',
            description: 'The name of the project',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const newActiveProject = interaction.options.getString('project').toLowerCase();
        const usernameId = interaction.user.id;
        const username = interaction.user.username;
        const employeeInfo = employeesInfo[username];
        const previousActiveProject = employeeInfo.activeProject;

        if (!employeeInfo) {
            return interaction.editReply(`You are not clocked in.`);
        }

        if (employeeInfo.activeProject === newActiveProject) {
            return interaction.editReply(`You are already working on ${newActiveProject}.`);
        }

        const hoursWorked = setActiveProject(employeeInfo, newActiveProject);
        console.log(`hoursWorked: ${hoursWorked}`);
        if (hoursWorked) {
            return interaction.editReply(`You are now working on ${newActiveProject}. You worked ${hoursWorked} hours on ${previousActiveProject}.`);
        }
        else {
            return interaction.editReply(`You are now working on ${newActiveProject}.`);
        }        
    }
};
