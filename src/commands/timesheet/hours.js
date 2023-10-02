/* 
Created By: Himay
Creation Date: 9/02/2023
Last Edit Date: 10/01/2023
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
  name: 'hours',
  description: 'Hours Command',
  options: [
    {
      name: 'day',
      description: 'Get hours for selected day',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Current', value: 'current' },

      ]
    },
    {
      name: 'month',
      description: 'Get hours for the month',
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: 'year',
      description: 'Get hours for the year',
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: 'project',
      description: 'Get hours for the project',
      type: ApplicationCommandOptionType.String,
    }
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply();



    const dayOption = interaction.options.getString('day');
    const monthOption = interaction.options.getInteger('month');
    const yearOption = interaction.options.getInteger('year');
    const projectOption = interaction.options.getString('project');

    // Check if day, month, and year options are not provided or blank, then use the current date.
    const currentDate = new Date();
    const day = dayOption === 'current' ? currentDate.getDate() : dayOption;
    const month = monthOption || currentDate.getMonth() + 1; // Month is 0-based.
    const year = yearOption || currentDate.getFullYear();

    const databaseQuery = {
      employeeID: interaction.user.id,
      year: year
    };

    // Fetch the timesheet from the database
    const timesheet = await Timesheet.findOne(databaseQuery);

    // Now you can use 'day', 'month', 'year', and 'project' as needed in your command logic.
    // If the user didn't provide these options, they will default to the current date.

    console.log(`Day: ${day}, Month: ${month}, Year: ${year}, Project: ${projectOption}`);
    interaction.editReply(`Day: ${day}, Month: ${month}, Year: ${year}, Project: ${projectOption}\nTotal Hours: ${timesheet.totalHours}`);

  },
};
