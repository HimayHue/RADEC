/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { clockOut } = require('../../utils/timesheetFunctions');
let { employeesInfo } = require('../../utils/timesheetFunctions');
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

        const employeeID = interaction.user.id;

        let clockOutInfo = clockOut(employeeID, new Date());

        return interaction.editReply(`${clockOutInfo}`);
        

    }
};
