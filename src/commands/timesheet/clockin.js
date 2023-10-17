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
    description: 'Clock In',
    options: [
        {
            name: 'project',
            description: 'Name of the active project',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        // only allow users with Radec role to clock in
        const role = interaction.guild.roles.cache.find(role => role.name === "Radec");
        if (!interaction.member.roles.cache.has(role.id)) {
            return interaction.editReply(`You do not have permission to clock in.`);
        }
        
        // if project is specified, set it as the active project
        const activeProject = interaction.options.getString('project')? interaction.options.getString('project').toLowerCase() : null;
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        console.log(`project: ${activeProject}`);
        let clockedInTime = clockIn(username, usernameId, new Date(), activeProject);

        if (clockedInTime) {
            console.log(`\nemployeeInfo: ${JSON.stringify(employeesInfo)}`);
            return interaction.editReply(`You have clocked in at ${clockedInTime.toLocaleString()}`);
        }
        else {

            console.log(`\nemployeeInfo: ${JSON.stringify(employeesInfo)}`);
            return interaction.editReply(`You are already clocked in at ${employeesInfo[username].clockedInTime.toLocaleString()}`);
        }

    }
};
