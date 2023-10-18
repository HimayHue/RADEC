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
        console.log(`\nSET PROJECT COMMAND`);
        await interaction.deferReply();

        const newActiveProject = interaction.options.getString('project').toLowerCase();
        const employeeID = interaction.user.id;

        let setActiveProjectOutput = setActiveProject(employeeID, newActiveProject);

        return interaction.editReply(`${setActiveProjectOutput}`);
    }
};
