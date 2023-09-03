/* 
Created By: Himay
Creation Date: 9/02/2023
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

  name: 'hours',
  description: 'Hours Command',
  options: [
    {
      name: 'day',
      description: 'Get hours for the day',
      type: ApplicationCommandOptionType.Integer,
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
    }
  ],
  deleted: false,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const dayOption = interaction.options.getInteger('day');
    const monthOption = interaction.options.getInteger('month');
    const yearOption = interaction.options.getInteger('year');

    const usernameId = interaction.user.id;
    const username = interaction.user.username;
    const userTag = interaction.user.displayName;

    let totalHours = '';

    console.log(`Day Option: ${dayOption}`);
    console.log(`Month Option: ${monthOption}`);
    console.log(`Year Option: ${yearOption}`);

    // if only year is provided

    if (yearOption && !monthOption && !dayOption) {
      totalHours = await getYearHours(usernameId, yearOption);

      interaction.editReply(
        `Total Hours for ${userTag} in ${yearOption} is ${totalHours}`
      );
    }

    // if only month is provided

    // if only day is provided

    // if none are provided

  },
};


async function getDayHours(employeeID) {
  console.log(`ran get day hours for ${employeeID}`);

}

async function getWeekHours() {

}

async function getMonthHours() {

}

async function getYearHours(usernameId, yearOption) {
  try {
    const yearTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: yearOption });

    if (!yearTimesheet) {
      console.log(`No timesheet found for userId: ${usernameId}`);
      return; // Return or handle the case where the user's timesheet doesn't exist
    }

    const totalHours = yearTimesheet.totalHours;
    console.log(`Total hours for ${usernameId} in 2023: ${totalHours}`);
    return totalHours.toString();

  }
  catch (error) {
    console.error(`Error fetching total hours: ${error}`);
  }
}

async function getTotalHours(usernameId) {
  try {
    const yearTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: 2023 });

    if (!yearTimesheet) {
      console.log(`No timesheet found for userId: ${usernameId}`);
      return; // Return or handle the case where the user's timesheet doesn't exist
    }

    const totalHours = yearTimesheet.totalHours;
    console.log(`Total hours for ${usernameId} in 2023: ${totalHours}`);
    return totalHours.toString();
  } catch (error) {
    console.error(`Error fetching total hours: ${error}`);
    // Handle the error appropriately (e.g., logging, sending a message, etc.)
  }
}