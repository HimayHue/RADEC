/* 
Created By: Himay
Creation Date: 9/02/2023
Last Edit Date: 10/11/2023
Last Edit Notes:
Implemented the hours command. It will return the hours worked for the day, month, or year.

Important Notes:
TODO: 
Implement the project option. It will return the hours worked for the project for the day, month, or year;
Account for leap years in the daysInMonth object;


*/


const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

const { Timesheet } = require("../../models/Timesheet");
const { findYearTimesheet, getHours } = require('../../utils/timesheetFunctions');

require("dotenv").config();

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const daysInMonth = {
  January: 31,
  February: 28, // 29 in a leap year
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
}


module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
  */

  name: 'gethours',
  description: 'Returns the hours worked for the day, month, or year.',
  deleted: false,
  options: [
    {
      name: 'day',
      description: 'Get hours for selected day.',
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'month',
      description: 'Get hours for the selected month.',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Current', value: `${currentDate.toLocaleString('en-US', { month: 'long' })}` },
        { name: `January`, value: 'January' },
        { name: `February`, value: 'February' },
        { name: `March`, value: 'March' },
        { name: `April`, value: 'April' },
        { name: `May`, value: 'May' },
        { name: `June`, value: 'June' },
        { name: `July`, value: 'July' },
        { name: `August`, value: 'August' },
        { name: `September`, value: 'September' },
        { name: `October`, value: 'October' },
        { name: `November`, value: 'November' },
        { name: `December`, value: 'December' }
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
    let currentDate = new Date();

    await interaction.deferReply();

    if (interaction.user.username != 'himay') {
      return interaction.editReply('You do not have permission to use this command.');
    }

    const dayOption = interaction.options.getString('day');
    let monthOption = interaction.options.getString('month');
    const yearOption = interaction.options.getInteger('year');
    const projectOption = interaction.options.getString('project');

    // if `day` is `today` or `current` use current date, otherwise use the day provided
    const day = dayOption ? (dayOption.toLowerCase() === 'current' || dayOption.toLowerCase() === 'today' ? currentDate.getDate() : dayOption) : dayOption;

    // if `day` is selected but `month` is not, or if `day` is 'current' use current month, else use the month provided
    const monthName = (dayOption && !monthOption) ? currentDate.toLocaleString('en-US', { month: 'long' }) : monthOption;
    const monthNumber = monthName ? months.indexOf(monthName) + 1 : monthName;

    // `year` can never be null, so if it is, use current year
    const year = yearOption ? yearOption : currentDate.getFullYear();

    // if day was selected but is not a number, return error
    if (!/^\d+$/.test(day)) {
      return interaction.editReply(`Invalid day. Please enter a number.`);
    }

    // if day was selected but is not within range of the month, return error
    if (day && !(0 < day && day <= daysInMonth[monthName])) {
      return interaction.editReply(`Invalid day. Please enter a day between 1 and ${daysInMonth[monthOption]}.`);
    }

    try {
      let hours = await getHours(day, monthNumber, year, interaction.user.id);

      if (hours) {
        let message = "Searched hours for";

        if (monthNumber !== null) {
          message += ` ${monthName}`;
        }
        if (day !== null) {
          message += ` ${day}`;
        }
        if (year !== null) {
          message += ` ${year}`;
        }

        message += `:\n${hours}`;

        return interaction.editReply(message);
      }
      else {
        let message = "Hours not found for";

        if (monthNumber !== null) {
          message += ` ${monthName}`;
        }
        if (day !== null) {
          message += ` ${day}`;
        }
        if (year !== null) {
          message += ` ${year}`;
        }

        return interaction.editReply(message);
      }
    }
    catch (error) {
      let message = "Timesheet not found for";

      if (monthNumber !== null) {
        message += ` ${monthName}`;
      }
      if (day !== null) {
        message += ` ${day}`;
      }
      if (year !== null) {
        message += ` ${year}`;
      }

      return interaction.editReply(message);
    }
  },
};
