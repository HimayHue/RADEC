/* 
Created By: Himay
Creation Date:
Last Edit Date:5/24/2023
Last Edit Notes: RADEC now automatically updates the timesheet of a user when they join or leave the voice channel.

Important Notes:
Runs off of Arizona USA Time Zone
*/

const { 
  Client, 
  VoiceState 
} = require("discord.js");

const {
  Timesheet,
  SessionTimesheet,
  DayTimesheet,
  MonthTimesheet,
} = require("../../models/Timesheet");

require("dotenv").config();

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

  let roleRequiredID = process.env.RADEC_ROLE_ID;
  let voiceChannelID = process.env.RADEC_OFFICE_VOICE_ID; // Only tracks the RADEC Office voice channel
  let timesheetTextChannelID = process.env.TIMESHEET_TEXT_CHANNEL_ID; // The channel where the bot will send messages about users joining and leaving the voice channel

  const arizonaDate = new Date();
  const currentArizonaYear = arizonaDate.getFullYear();

  const databaseQuery = {
    employeeID: usernameId,
    year: currentArizonaYear,
  };

  if (newState.member.roles.cache.has(roleRequiredID) ) {

    // USER JOINS VOICE CHAT
    if (newState.channelId == voiceChannelID && !employeesTimeIn[usernameId]) {
      //TODO: Set a bool variable named clockedIn

      clockIn(usernameId, arizonaDate);
      console.log(`\n${username} is clocking in at ${arizonaDate.toLocaleString()}`);

      client.channels.cache
        .get(timesheetTextChannelID) 
        .send(
          `[Join] <@${usernameId}> has joined ${
            newState.channel.name
          } - ${arizonaDate.toLocaleString()}`
        );
    }
    // USER LEAVES VOICE CHAT
    else if (oldState.channelId == voiceChannelID && newState.channelId != voiceChannelID && employeesTimeIn[usernameId]) {
      //TODO: Set a bool variable named clockedOut

      clockOut(
        employeesTimeIn[usernameId],
        arizonaDate,
        databaseQuery,
        username,
        false
      );

      console.log(`\n${username} is clocking out at ${arizonaDate.toLocaleString()}`);

      delete employeesTimeIn[usernameId];

      client.channels.cache
        .get(timesheetTextChannelID)
        .send(
          `[Left] <@${usernameId}> has Left ${
            oldState.channel.name
          } - ${arizonaDate.toLocaleString()}`
        );
    }
  }
};
 
function clockIn(usernameId, timeIn) {
  // Check if the user is already in the array
  if (employeesTimeIn.hasOwnProperty(usernameId)) {
    // User is already in the array, you can handle this case as needed
    console.log(`User ${usernameId} is already clocked in at ${employeesTimeIn[usernameId]}`);
  } else {
    // User is not in the array, so we can clock them in
    employeesTimeIn[usernameId] = timeIn;
    console.log(`User ${usernameId} clocked in at ${timeIn}`);
  }
}


async function clockOut(
  employeeTimeIn,
  employeeTimeOut,
  query,
  username,
  addHoursToCorrectDates /** @type {boolean} */
) {
  if (
    addHoursToCorrectDates &&
    employeesTimeIn[query.usernameId].getDate() != employeeTimeOut.getDate()
  ) {
    // CASE: users works into a new month
    // CASE: user works into a new year
    // CASE: user works into a new day
  }
  // adds the total hours worked to the date of timeIn
  else {
    await findDayTimesheet(employeeTimeIn, employeeTimeOut, query, username);
  }
}

async function findDayTimesheet(
  employeeTimeIn,
  employeeTimeOut,
  query,
  username
) {
  try {
    let yearTimesheet = await Timesheet.findOne(query);
    // Check if the yearTimesheet exists
    console.log(
      `\nTimesheet for ${username} was ${yearTimesheet ? "" : "NOT "}found`
    );
    // console.log(`Timesheet for ${username}: ${JSON.stringify(yearTimesheet)}`);

    if (yearTimesheet) {
      yearTimesheet.lastOnline = employeeTimeOut.toLocaleString();

      // Check the months array in the yearTimesheet
      // console.log(`\nMonths Array: ${JSON.stringify(yearTimesheet.months)}`);
      // console.log(`Searching for Month ${employeeTimeIn.getMonth() + 1}`);
      let monthIndex = yearTimesheet.months.findIndex((month) => month.month === employeeTimeIn.getMonth() + 1); // +1 because getMonth() returns 0-11

      console.log(`\nMonth Timesheet for ${username} was 
      ${monthIndex != -1 ? "" : "NOT "}
      found: ${monthIndex}`);

      if (monthIndex != -1) { // -1 means the month was not found
        // Check the days array in the monthTimesheet
        
        // console.log(`Searching for Day ${employeeTimeIn.getDate()}`);
        let dayIndex = yearTimesheet.months[monthIndex].days.findIndex(
          (day) => day.day === employeeTimeIn.getDate()
        );

        console.log(`\nDay Timesheet for ${username} was 
        ${dayIndex != -1 ? "" : "NOT "}
        found: ${dayIndex}`);

        if (dayIndex != -1) {
          updateTimesheet(
            username,
            yearTimesheet,
            monthIndex,
            dayIndex,
            employeeTimeIn,
            employeeTimeOut
          );
        } else {
          dayIndex = yearTimesheet.months[monthIndex].days.length; // set dayIndex to the length of the array
          // Add the new day to the month
          let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
          yearTimesheet.months[monthIndex].days.push(dayTimesheet);

          updateTimesheet(
            username,
            yearTimesheet,
            monthIndex,
            dayIndex,
            employeeTimeIn,
            employeeTimeOut
          );
        }
      } else {
        monthIndex = yearTimesheet.months.length; // set monthIndex to the length of the array
        // Add the new month to the year
        let monthTimesheet = createNewMonthTimesheet(
          employeeTimeIn.getMonth() + 1
        ); // +1 because getMonth() returns 0-11
        yearTimesheet.months.push(monthTimesheet);

        dayIndex = yearTimesheet.months[monthIndex].days.length; // set dayIndex to the length of the array
        // Add the new day to the month
        let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
        yearTimesheet.months[monthIndex].days.push(dayTimesheet);

        updateTimesheet(
          username,
          yearTimesheet,
          monthIndex,
          dayIndex,
          employeeTimeIn,
          employeeTimeOut
        );
      }
    } else {
      // Create the 3 timesheets
      yearTimesheet = createNewTimesheet(query, username);
      let monthTimesheet = createNewMonthTimesheet(
        employeeTimeIn.getMonth() + 1
      ); // +1 because getMonth() returns 0-11
      let dayTimesheet = createNewDayTimesheet(employeeTimeIn.getDate());
      const sessionTimesheet = createNewSessionTimesheet(
        employeeTimeIn,
        employeeTimeOut
      );

      // Update timesheet hours
      dayTimesheet.totalHours += sessionTimesheet.totalHours;
      monthTimesheet.totalHours += sessionTimesheet.totalHours;
      yearTimesheet.totalHours += sessionTimesheet.totalHours;


      // Push objects into timesheets
      dayTimesheet.sessions.push(sessionTimesheet);
      monthTimesheet.days.push(dayTimesheet);
      yearTimesheet.months.push(monthTimesheet);

      await yearTimesheet.save().catch((e) => {
        console.log(`Error saving new timesheet for ${username}: ${e}`);
      });

      console.log(
        `Created new Year Timesheet for ${username}: ${JSON.stringify(
          yearTimesheet
        )}`
      );
    }
  } catch (error) {
    // If an error occurs, log the error
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}

async function updateTimesheet(
  username,
  yearTimesheet,
  monthIndex,
  dayIndex,
  employeeTimeIn,
  employeeTimeOut
) {
  console.log(
    `Day Timesheet for ${username}: ${yearTimesheet.months[monthIndex].days[dayIndex]}`
  );

  const sessionTimesheet = createNewSessionTimesheet(
    employeeTimeIn,
    employeeTimeOut
  );
  console.log(
    `\nCreated new Session Timesheet for ${username}: ${JSON.stringify(
      sessionTimesheet
    )}`
  );

  // Update the total hours for day, month, and year
  yearTimesheet.months[monthIndex].days[dayIndex].totalHours += sessionTimesheet.totalHours;
  yearTimesheet.months[monthIndex].totalHours += sessionTimesheet.totalHours;
  yearTimesheet.totalHours += sessionTimesheet.totalHours;

  console.log(
    `\nUpdated Hours. \nDay: ${yearTimesheet.months[monthIndex].days[dayIndex].totalHours} \nMonth: ${yearTimesheet.months[monthIndex].totalHours} \nYear: ${yearTimesheet.totalHours}`
  );

  // Add the session to the day timesheet
  yearTimesheet.months[monthIndex].days[dayIndex].sessions.push(
    sessionTimesheet
  );
  

  // Mark the 'days' and 'months' arrays as modified
  yearTimesheet.months[monthIndex].markModified("days");
  yearTimesheet.markModified("months");

  try {
    await yearTimesheet.save();
    console.log(`\nUpdated timesheet for ${username}`);
    console.log(`Year Timesheet: ${yearTimesheet}`);
  } catch (error) {
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}

function createNewSessionTimesheet(timeIn, timeOut) {
  const millisecondsPerHour = 3600000; // Number of milliseconds in an hour

  const totalMilliseconds = timeOut.getTime() - timeIn.getTime();
  const totalHours = parseFloat((totalMilliseconds / millisecondsPerHour).toFixed(3));

  const formattedTimeIn = timeIn.toLocaleString("en-US", {
    timeZone: "America/Phoenix",
  });
  const formattedTimeOut = timeOut.toLocaleString("en-US", {
    timeZone: "America/Phoenix",
  });

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
    lastOnline: new Date().toLocaleString("en-US", {
      timeZone: "America/Phoenix",
    }),
    months: [],
    projects: [],
    activeProject: "",
  });
}
