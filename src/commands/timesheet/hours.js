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
    const monthOption = interaction.options.getInteger('month') - 1;
    const yearOption = interaction.options.getInteger('year');

    const usernameId = interaction.user.id;
    const username = interaction.user.username;

    let totalHours = '';

    console.log(`Day Option: ${dayOption}`);
    console.log(`Month Option: ${monthOption}`);
    console.log(`Year Option: ${yearOption}`);


    // Year Hours
    if (yearOption && !monthOption && !dayOption) {
      totalHours = await getYearHours(usernameId, yearOption);

      if (totalHours) {
        interaction.editReply(
          `Total Hours for <@${usernameId}> in ${yearOption} is ${totalHours}`
        );
      }
      else {
        interaction.editReply(
          `No hours found for <@${usernameId}> in ${yearOption}`
        );
      }
    }

    // Year and Month Hours
    else if (yearOption && monthOption && !dayOption) {
      totalHours = await getMonthHours(usernameId, yearOption, monthOption);

      if (totalHours) {
        interaction.editReply(
          `Total Hours for <@${usernameId}> in ${monthOption}/${yearOption} is ${totalHours}`
        );
      }
      else {
        interaction.editReply(
          `No hours found for <@${usernameId}> in ${monthOption}/${yearOption}`
        );
      }


      // if only day is provided

      // if none are provided

    }
  }
}


async function getDayHours(usernameId, year, month, day) {
  console.log(`ran get day hours for ${employeeID}`);
}


async function getMonthHours(usernameId, year, month) {
  const timesheet = await Timesheet.findOne({ employeeID: usernameId, year: year, month: month });
  if (!timesheet) {
    console.log(`No ${month}/${year} timesheet found for userId: ${usernameId}`);
    return;
  }
  else {
    const totalHours = timesheet.totalHours;
    return totalHours.toString();
  }
}

async function getYearHours(usernameId, year) {
  const timesheet = await Timesheet.findOne({ employeeID: usernameId, year: year });

  if (!timesheet) {
    console.log(`No ${year} timesheet found for userId: ${usernameId}`);
    return;
  }

  const totalHours = timesheet.totalHours;
  return totalHours.toString();
}

async function getTotalHours(usernameId) {
  try {
    const timesheet = await Timesheet.findOne({ employeeID: usernameId, year: 2023 });

    if (!timesheet) {
      console.log(`No timesheet found for userId: ${usernameId}`);
      return; // Return or handle the case where the user's timesheet doesn't exist
    }

    const totalHours = timesheet.totalHours;
    console.log(`Total hours for ${usernameId} in 2023: ${totalHours}`);
    return totalHours.toString();
  } catch (error) {
    console.error(`Error fetching total hours: ${error}`);
    // Handle the error appropriately (e.g., logging, sending a message, etc.)
  }
}
async function getWeekHours(usernameId) {

}

async function findYearTimesheet() {
  let yearTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: yearOption });
  return yearTimesheet;
}

async function findMonthTimesheet() {
  let monthTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: yearOption, month: monthOption });
  return monthTimesheet;
}

async function findDayTimesheet() {
  let dayTimesheet = await Timesheet.findOne({ employeeID: usernameId, year: yearOption, month: monthOption, day: dayOption });
  return dayTimesheet;
}