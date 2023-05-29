/* 
Created By: Himay
Creation Date:
Last Edit Date:5/24/2023
Last Edit Notes:

Important Notes:
Runs off of Arizona USA Time Zone
*/

const { Client, VoiceState } = require("discord.js");
const { Timesheet, SessionTimesheet, DayTimesheet, MonthTimesheet } = require("../../models/Timesheet");
require("dotenv").config();



function clockIn(usernameId, timeIn) {
  employeesTimeIn[usernameId] = timeIn;
  console.log(`ACTIVE SESSIONS: ${JSON.stringify(employeesTimeIn)} \n`);
}

async function clockOut(employeeTimeIn, employeeTimeOut, query, username, addHoursToCorrectDates /** @type {boolean} */) {

  if (addHoursToCorrectDates && (employeesTimeIn[query.usernameId].getDate() != employeeTimeOut.getDate())) {
    // CASE: users works into a new month
    // CASE: user works into a new year
    // CASE: user works into a new day
  }
  // adds the total hours worked to the date of timeIn
  else {
    
    console.log(`\nUser is clocking out`);
    
    await findDayTimesheet(employeeTimeIn, employeeTimeOut, query, username);
    
  }
}

async function findDayTimesheet(employeeTimeIn, employeeTimeOut, query, username) {
  try {
    let yearTimesheet = await Timesheet.findOne(query);
    // Check if the yearTimesheet exists
    console.log(`\nTimesheet for ${username} was ${yearTimesheet ? '' : 'NOT '}found`);
    console.log(`Timesheet for ${username}: ${JSON.stringify(yearTimesheet)}`);

    if (yearTimesheet) {
      yearTimesheet.lastOnline = employeeTimeOut.toLocaleString();

      // Check the months array in the yearTimesheet
      console.log(`\nMonths Array: ${JSON.stringify(yearTimesheet.months)}`);
      console.log(`Searching for Month ${employeeTimeIn.getMonth() + 1}`);
      let monthIndex = yearTimesheet.months.findIndex((month) => month.month === (employeeTimeIn.getMonth()) + 1);
      // +1 because getMonth() returns 0-11
      console.log(`Month Timesheet for ${username} was ${(monthIndex != -1) ? '' : 'NOT '}found: ${monthIndex}`);

      if (monthIndex != -1) { // -1 means the month was not found
        // Check the days array in the monthTimesheet
        console.log(`\nDays Array: ${JSON.stringify(yearTimesheet.months[monthIndex].days)}`);
        console.log(`Searching for Day ${employeeTimeIn.getDate()}`);
        let dayIndex = yearTimesheet.months[monthIndex].days.findIndex((day) => day.day === employeeTimeIn.getDate());
        console.log(`Day Timesheet for ${username} was ${(dayIndex != -1) ? '' : 'NOT '}found: ${dayIndex}`);

        if (dayIndex != -1) {
          updateTimesheet(username, yearTimesheet, monthIndex, dayIndex, employeeTimeIn, employeeTimeOut);
        } else {
          dayIndex = yearTimesheet.months[monthIndex].days.length; // set dayIndex to the length of the array
          // Add the new day to the month
          let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
          yearTimesheet.months[monthIndex].days.push(dayTimesheet);

          updateTimesheet(username, yearTimesheet, monthIndex, dayIndex, employeeTimeIn, employeeTimeOut);
        }
      } else {
        monthIndex = yearTimesheet.months.length; // set monthIndex to the length of the array
        // Add the new month to the year
        let monthTimesheet = createNewMonthTimesheet(employeeTimeIn.getMonth() + 1); // +1 because getMonth() returns 0-11
        yearTimesheet.months.push(monthTimesheet);

        dayIndex = yearTimesheet.months[monthIndex].days.length; // set dayIndex to the length of the array
        // Add the new day to the month
        let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
        yearTimesheet.months[monthIndex].days.push(dayTimesheet);

        updateTimesheet(username, yearTimesheet, monthIndex, dayIndex, employeeTimeIn, employeeTimeOut);
      }
    } else {
      // Create the 3 timesheets
      yearTimesheet = createNewTimesheet(query, username);
      let monthTimesheet = createNewMonthTimesheet(employeeTimeIn.getMonth() + 1); // +1 because getMonth() returns 0-11
      let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
      const sessionTimesheet = createNewSessionTimesheet(employeeTimeIn, employeeTimeOut);

      console.log(`\nCreated new Session Timesheet for ${username}: ${JSON.stringify(sessionTimesheet)}`);

      // Update timesheet hours
      dayTimesheet.totalHours += sessionTimesheet.totalHours;
      monthTimesheet.totalHours += sessionTimesheet.totalHours;
      yearTimesheet.totalHours += sessionTimesheet.totalHours;

      console.log(`\nUpdated Hours for timesheets \nYear: ${yearTimesheet.totalHours}\nMonth: ${monthTimesheet.totalHours}\nDay ${dayTimesheet.totalHours}`);

      // Push objects into timesheets
      dayTimesheet.sessions.push(sessionTimesheet);
      monthTimesheet.days.push(dayTimesheet);
      yearTimesheet.months.push(monthTimesheet);

      console.log(`Created new Day Timesheet for ${username}: ${JSON.stringify(dayTimesheet)}`);
      console.log(`Created new Month Timesheet for ${username}: ${JSON.stringify(monthTimesheet)}`);

      await yearTimesheet.save().catch((e) => {
        console.log(`Error saving new timesheet for ${username}: ${e}`);
      });

      console.log(`Created new Year Timesheet for ${username}: ${JSON.stringify(yearTimesheet)}`);
    }
  }
  // If an error occurs, log the error
  catch (error) {
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}


async function updateTimesheet(username, yearTimesheet, monthIndex, dayIndex, employeeTimeIn, employeeTimeOut) {
  console.log(`Day Timesheet for ${username}: ${JSON.stringify(yearTimesheet.months[monthIndex].days[dayIndex])}`);
  
  const sessionTimesheet = createNewSessionTimesheet(employeeTimeIn, employeeTimeOut);
  console.log(`\nCreated new Session Timesheet for ${username}: ${JSON.stringify(sessionTimesheet)}`);

  // Update the total hours for day, month, and year
  yearTimesheet.months[monthIndex].days[dayIndex].totalHours += sessionTimesheet.totalHours;
  yearTimesheet.months[monthIndex].totalHours += sessionTimesheet.totalHours;
  yearTimesheet.totalHours += sessionTimesheet.totalHours;
  console.log(`\nUpdated Hours. \nDay: ${yearTimesheet.months[monthIndex].days[dayIndex].totalHours} \nMonth: ${yearTimesheet.months[monthIndex].totalHours} \nYear: ${yearTimesheet.totalHours}`);

  // Add the session to the day timesheet
  yearTimesheet.months[monthIndex].days[dayIndex].sessions.push(sessionTimesheet);
  console.log(`\nUpdated Day Timesheet for ${username}: ${JSON.stringify(yearTimesheet.months[monthIndex].days[dayIndex])}`);

  // Mark the 'days' and 'months' arrays as modified
  yearTimesheet.months[monthIndex].markModified('days');
  yearTimesheet.markModified('months');

  try {
    await yearTimesheet.save();
    console.log(`\nUpdated timesheet for ${username}`);
    console.log(`Year Timesheet: ${JSON.stringify(yearTimesheet)}`);
  } catch (error) {
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}

function createNewSessionTimesheet(timeIn, timeOut) {
  const millisecondsPerHour = 3600000; // Number of milliseconds in an hour

  const totalMilliseconds = timeOut.getTime() - timeIn.getTime();
  const totalHours = (totalMilliseconds / millisecondsPerHour).toFixed(3);

  const formattedTimeIn = timeIn.toLocaleString('en-US', { timeZone: 'America/Phoenix' });
  const formattedTimeOut = timeOut.toLocaleString('en-US', { timeZone: 'America/Phoenix' });

  return new SessionTimesheet({
    timeIn: formattedTimeIn,
    timeOut: formattedTimeOut,
    totalHours: parseFloat(totalHours),
  });
}

function createNewDayTimesheet(day) {
  return new DayTimesheet({
    day: day,
    totalHours: 0,
    sessions: [],
  });
}

function createNewMonthTimesheet(month) {
  return new MonthTimesheet({
    month: month,
    totalHours: 0,
    days: [],
  });
}

function createNewTimesheet(query, username) {
  return new Timesheet({
    employeeID: query.employeeID,
    name: username,
    year: query.year,
    totalHours: 0,
    lastOnline: new Date().toLocaleString(),
    months: [],
    projects: [],
    activeProject: '',
  });
}

const employeesTimeIn = {};

/**
 * A function that handles the update of a user's timesheet based on changes in their voice state.
 * @param {Client} client The client instance (bot) that will be used to manage the Discord interactions.
 * @param {VoiceState} oldState The previous state of the user's voice connection.
 * @param {VoiceState} newState The new state of the user's voice connection.
 */

module.exports = async (client, oldState, newState) => {

  const username = newState.member.displayName;
  const usernameId = newState.member.user.id;

  let roleRequiredId = process.env.RADEC_ROLE_ID;
  let voiceChannelId = process.env.RADEC_OFFICE_VOICE_ID;
  let timesheetChannelId = process.env.TIMESHEET_TEXT_CHANNEL_ID;
  
  const arizonaDate = new Date();
  const currentArizonaYear = arizonaDate.getFullYear();
  
  console.log(`AZ Time: ${arizonaDate}`);

  const query = {
    employeeID: usernameId,
    year: currentArizonaYear,
  };


  if (newState.member.roles.cache.has(roleRequiredId)) {
    // USER JOINS VOICE CHAT
    if (newState.channelId == voiceChannelId) {  //TODO: Set a bool variable named clockedIn

      clockIn(usernameId, arizonaDate);

      client.channels.cache.get(timesheetChannelId).send(
          `[Join] <@${usernameId}> has joined ${newState.channel.name} - ${arizonaDate.toLocaleString()}`
        );

    } 

    // USER LEAVES VOICE CHAT
    else if (oldState.channelId == voiceChannelId) { //TODO: Set a bool variable named clockedOut

      clockOut(employeesTimeIn[usernameId], arizonaDate, query, username, false);
      
      delete employeesTimeIn[usernameId];
    
      client.channels.cache.get(timesheetChannelId).send(
        `[Left] <@${usernameId}> has Left ${oldState.channel.name} - ${arizonaDate.toLocaleString()}`
      );

    }
  }
};
