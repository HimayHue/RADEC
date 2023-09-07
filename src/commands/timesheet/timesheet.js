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

const { Timesheet } = require("../../models/Timesheet");

require("dotenv").config();



module.exports = {

    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    name: 'timesheet',
    description: 'Timesheet Commands',
    options: [
        {
            name: 'project',
            description: 'Set the active project',
            type: ApplicationCommandOptionType.String,
        }
    ],
    deleted: false,

    // Check for options an
    callback: async (client, interaction) => {
        await interaction.deferReply();

        const activeProject = interaction.options.getString('project');

        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        if (activeProject) {
            interaction.editReply(
                `<@${usernameId}> has set their active project to **${activeProject}**`
            );
        };



    }
}


async function findYearTimesheet() {
    let yearTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: yearOption });
    return yearTimesheet;
}