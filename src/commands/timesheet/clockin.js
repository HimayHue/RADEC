/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType, MessageActionRow, MessageButtonComponent } = require('discord.js');
const { clockIn } = require('../../utils/timesheetFunctions');
require('dotenv').config();

// Define an object to store employee information
const employeeInfo = {};

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

        if (interaction.user.username != 'himay') {
            return interaction.editReply('You do not have permission to use this command.');
        }

        const activeProject = interaction.options.getString('projectname');
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        if (employeeInfo[usernameId]) {
            // Employee is already clocked in
            const existingClockedInTime = employeeInfo[usernameId].clockedInTime;

            // Offer the option to overwrite or keep the old time
            const overwriteButton = new MessageButtonComponent()
                .setCustomId('overwrite')
                .setLabel('Overwrite')
                .setStyle('PRIMARY');

            const keepButton = new MessageButtonComponent()
                .setCustomId('keep')
                .setLabel('Keep')
                .setStyle('SECONDARY');

            const row = new MessageActionRow().addComponent(overwriteButton).addComponent(keepButton);

            await interaction.editReply({
                content: `${username} is already clocked in at ${existingClockedInTime}. Do you want to overwrite your time or keep the old one?`,
                components: [row],
            });

            const filter = i => i.customId === 'overwrite' || i.customId === 'keep';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'overwrite') {
                    // Overwrite the clock-in time
                    const clockedInTime = new Date();
                    employeeInfo[usernameId].clockedInTime = clockedInTime;
                    employeeInfo[usernameId].activeProject = activeProject;
                    clockIn(username, clockedInTime);
                    await i.update(`You have clocked in at ${clockedInTime.toLocaleString()}`);
                } else if (i.customId === 'keep') {
                    // Keep the old clock-in time
                    await i.update(`Keeping the old clock-in time at ${existingClockedInTime}.`);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp('Time selection has ended. Clock-in canceled.');
                }
            });
        } else {
            // Store employee information
            const clockedInTime = new Date();
            employeeInfo[usernameId] = {
                username,
                clockedInTime,
                activeProject,
            };

            // Perform the clock-in action
            clockIn(username, clockedInTime);

            interaction.editReply(`${username} clocked in at ${clockedInTime.toLocaleString()}`);
        }
    }
};
