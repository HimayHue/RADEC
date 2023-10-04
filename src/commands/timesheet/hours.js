/* 
Created By: Himay
Creation Date: 9/02/2023
Last Edit Date: 10/03/2023
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
  description: 'Returns the hours worked for the day, month, or year.',
  options: [
    {
      name: 'day',
      description: 'Get hours for selected day.',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Current', value: 'current' },
        { name: `1`, value: '1' },
        { name: `2`, value: '2' },
        { name: `3`, value: '3' },
        { name: `4`, value: '4' },
        { name: `5`, value: '5' },
        { name: `6`, value: '6' },
        { name: `7`, value: '7' },
        { name: `8`, value: '8' },
        { name: `9`, value: '9' },
        { name: `10`, value: '10' },
        { name: `11`, value: '11' },
        { name: `12`, value: '12' },
        { name: `13`, value: '13' },
        { name: `14`, value: '14' },
        { name: `15`, value: '15' },
        { name: `16`, value: '16' },
        { name: `17`, value: '17' },
        { name: `18`, value: '18' },
        { name: `19`, value: '19' },
        { name: `20`, value: '20' },
        { name: `21`, value: '21' },
        { name: `22`, value: '22' },
        { name: `23`, value: '23' },
        { name: `24`, value: '24' },
        { name: `25`, value: '25' },
        { name: `26`, value: '26' },
        { name: `27`, value: '27' },
        { name: `28`, value: '28' },
        { name: `29`, value: '29' },
        { name: `30`, value: '30' },
        { name: `31`, value: '31'}
      ]
    },
    {
      name: 'month',
      description: 'Get hours for the selected month.',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Current', value: 'current' },
        { name: `January`, value: '1' },
        { name: `February`, value: '2' },
        { name: `March`, value: '3' },
        { name: `April`, value: '4' },
        { name: `May`, value: '5' },
        { name: `June`, value: '6' },
        { name: `July`, value: '7' },
        { name: `August`, value: '8' },
        { name: `September`, value: '9' },
        { name: `October`, value: '10' },
        { name: `November`, value: '11' },
        { name: `December`, value: '12' }
      ]
    },
    {
      name: 'year',
      description: 'Get hours for the selected year.',
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
