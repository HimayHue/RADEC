/* 
Created By: Himay
Creation Date: 9/04/2023
Last Edit Date: 9/02/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { Timesheet } = require('../../models/Timesheet');
require('dotenv').config();

module.exports = {
    name: 'setproject',
    description: 'Timesheet Commands',
    options: [
        {
            name: 'projectname',
            description: 'The name of the project',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const activeProject = interaction.options.getString('projectname');
        const usernameId = interaction.user.id;
        const username = interaction.user.username;

        if (activeProject) {
            // Update the activeProject in the database
            // Update the activeProject in the database
            try {
                const filter = { employeeID: usernameId };
                const update = { activeProject: activeProject };

                let timesheet = await Timesheet.findOneAndUpdate(filter, update, {
                    new: true, // Return the updated document
                    upsert: true, // Create a new document if it doesn't exist
                });

                if (timesheet) {
                    // Check if the activeProject exists in the projects array
                    const existingProject = timesheet.projects.find((project) => project.name === activeProject);

                    if (!existingProject) {
                        // If the activeProject doesn't exist, add it to the projects array
                        timesheet.projects.push({
                            name: activeProject,
                            creationDate: new Date().toLocaleString("en-US", {
                                timeZone: "America/Phoenix",
                            }),
                            lastWorkedDate: new Date().toLocaleString("en-US", {
                                timeZone: "America/Phoenix",
                            }),
                            totalTime: 0, // Initialize with zero time worked
                        });
                    }

                    // Save the updated timesheet
                    await timesheet.save();

                    interaction.editReply(
                        `<@${usernameId}> has set their active project to **${activeProject}**`
                    );
                    console.log(timesheet.activeProject);
                } else {
                    interaction.editReply('Failed to update the active project.');
                }
            } catch (error) {
                console.error(error);
                interaction.editReply('An error occurred while updating the active project.');
            }

        }
    }
};
