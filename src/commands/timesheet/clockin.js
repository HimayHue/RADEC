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
        console.log(`\nCLOCK IN COMMAND`);
        // only allow users with Radec role to clock in
        const role = interaction.guild.roles.cache.find(role => role.name === "Radec");
        if (!interaction.member.roles.cache.has(role.id)) {
            return interaction.editReply(`You do not have permission to clock in.`);
        }
        
        // if project is specified, set it as the active project
        const activeProject = interaction.options.getString('project')? interaction.options.getString('project').toLowerCase() : null;
        const employeeID = interaction.user.id;
        const employeeName = interaction.user.username;

        let clockInOutput = clockIn(employeeID, employeeName, new Date(), activeProject);

        return interaction.editReply(`${clockInOutput}`);

    }
};
