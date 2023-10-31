/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
} = require('discord.js');

let { getClockedInEmployeeInfo } = require("../../utils/timesheetFunctions");

require("dotenv").config();

module.exports = {

    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    name: 'timesheet',
    description: 'View your timesheet',
    deleted: false,

    // Check for options an
    callback: async (client, interaction) => {
        await interaction.deferReply();

        let employeeID = interaction.user.id;
        let employeeName = interaction.user.username;
        let timesheetInfo = getClockedInEmployeeInfo(employeeID);

        if (timesheetInfo) {
            return interaction.editReply(`Your current shift timesheet: ${JSON.stringify(timesheetInfo)}.`);
        } 
        else {
            return interaction.editReply(`You are currently not clocked in.`);
        }
    }
}