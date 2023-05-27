/* 
Created By: Himay
Creation Date:
Last Edit Date:5/24/2023
Last Edit Notes:

Important Notes:
Runs off of Arizona USA Time Zone
*/

const { Client, VoiceState } = require("discord.js");
const Timesheet = require("../../models/Timesheet");
require("dotenv").config();


// TODO REMOVE `USERNAME`
function createNewSession(debugMode, username, timeIn, timeOut = null) {
  const newSession = {
    name: username,
    timeIn: timeIn,
    timeOut: timeOut,
    totalHours: 0.0,
  };

  if (debugMode) {
    console.log(`New session created for ${username}: ${JSON.stringify(newSession)}`);
  }
  return newSession;
}

function clockIn(debugMode, usernameId, username, timeIn) {
  activeSessions[usernameId] = createNewSession(true, username, timeIn);

  if (debugMode) {
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)} \n`)
  }
}

async function clockOut(usernameId, timeOut, query, username, addHoursToCorrectDates /** @type {boolean} */) {

  if (addHoursToCorrectDates && (activeSessions[usernameId].timeIn.getDate() != timeOut.getDate())) {
    // CASE: users works into a new month
    // CASE: user works into a new year
    // CASE: user works into a new day
  }
  // adds the total hours worked to the date of timeIn
  else { 
    activeSessions[usernameId].timeOut = timeOut;
    activeSessions[usernameId].totalHours =parseFloat(
      (
        (activeSessions[usernameId].timeOut - activeSessions[usernameId].timeIn) /
        (1000 * 60 * 60)
      ).toFixed(3)
    );
    activeSessions[usernameId].timeIn.toLocaleString()
    activeSessions[usernameId].timeOut.toLocaleString()

    console.log(`\nUser is clocking out`)
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)}`)

    
    await updateTimesheet(activeSessions[usernameId], query, username);

    delete activeSessions[usernameId];
    console.log(`\nUser clocked out and session deleted`)
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)} \n`)

  }
}

async function updateTimesheet(session, query, username){
  try {
    const yearTimesheet = await Timesheet.findOne(query);
    console.log(`\nTimesheet for ${username} was ${yearTimesheet ? '' : 'NOT '}found`);


    if (yearTimesheet) {
      yearTimesheet.lastOnline = session.timeOut.toLocaleString();

      console.log(`Months Array: ${JSON.stringify(yearTimesheet.months)}`);

      console.log(`Searching for Month ${session.timeIn.getMonth()}`);
      const monthIndex = yearTimesheet.months.findIndex((month) => month.month === (session.timeIn.getMonth()));
      console.log(`Month Timesheet for ${username} was ${monthIndex ? '' : 'NOT '}found`);

      if (monthIndex) {
        console.log(`Days Array: ${JSON.stringify(monthTimesheet.days)}`);

        const dayIndex = yearTimesheet.months[monthIndex].days.find((day) => day.day === session.timeIn.getDate());
        console.log(`\nDay Timesheet for ${username} was ${dayIndex ? '' : 'NOT '}found`);

        if (dayIndex != -1) {
          //console.log(`Sessions Array: ${JSON.stringify(dayTimesheet.ses)}`);

          // ***** updateTimesheetHours ***** 
          yearTimesheet.months[monthIndex].days[dayIndex].totalHours += session.totalHours;
          yearTimesheet.months[monthIndex].totalHours += session.totalHours;
          yearTimesheet.totalHours += session.totalHours;
          console.log(`Updated Hours. \nday: ${dayTimesheet.totalHours} \nmonth ${monthTimesheet.totalHours} \nyear${yearTimesheet.totalHours} `)
          // ***** updateTimesheetHours ***** 
          dayTimesheet.sessions.push(session);

          await yearTimesheet.save();

          // TODO: Save to database


        }
        else {
          // ***** addNewDay ***** 
          const newDayTimesheet = new DayTimesheet(session.timeIn.getDate())
          console.log(`Created new Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);

          // ***** updateTimesheetHours ***** 
          newDayTimesheet.totalHours += session.totalHours;
          monthTimesheet.totalHours += session.totalHours;
          yearTimesheet.totalHours += session.totalHours;
          // ***** updateTimesheetHours ***** 

          newDayTimesheet.sessions.push(session);
          console.log(`Updated Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);

          monthTimesheet.days.push(newDayTimesheet);
          // ***** addNewDay ***** 

          // TODO: Save to database

          console.log(`Updated Year Timesheet for ${username}: ${JSON.stringify(yearTimesheet)}`);
          
          await yearTimesheet.save().catch((e) => {
            console.log(`Error updating yearTimesheet for ${username}: ${e}`);
          });

        }
      }
      else {
        // ***** addNewDay ***** 
        const newDayTimesheet = new DayTimesheet(session.timeIn.getDate())
        console.log(`\nCreated new Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);
      
        newDayTimesheet.sessions.push(session);
        console.log(`Updated Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);

       // ***** addNewMonth ***** 

        const newMonthTimesheet = new MonthTimesheet(session.timeIn.getMonth())
        newMonthTimesheet.days.push(newDayTimesheet); 
        console.log(`Created new Month Timesheet for ${username}: ${JSON.stringify(newMonthTimesheet)}`);

      }
    }
    else {

      // ***** addNewDay ***** 
      const newDayTimesheet = new DayTimesheet(session.timeIn.getDate())
      console.log(`Created new Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);
      
      newDayTimesheet.sessions.push(session);
      console.log(`Updated Day Timesheet for ${username}: ${JSON.stringify(newDayTimesheet)}`);

      // ***** addNewMonth ***** 
      const newMonthTimesheet = new MonthTimesheet(session.timeIn.getMonth())
      newMonthTimesheet.days.push(newDayTimesheet);

      // ***** addNewYear *****
      const newYearTimesheet = new Timesheet({
            employeeID: query.employeeID,
            name: username,
            year: query.year,
            totalHours: 0,
            lastOnline: session.timeOut.toLocaleString(),
            months: [newMonthTimesheet], // Assign the array with newMonth to months property
            projects: [],
      });

      // ***** updateTimesheetHours ***** 
      newDayTimesheet.totalHours += session.totalHours;
      newMonthTimesheet.totalHours += session.totalHours;
      newYearTimesheet.totalHours += session.totalHours;
      // ***** updateTimesheetHours ***** 

      await newYearTimesheet.save().catch((e) => {
        console.log(`Error creating new timesheet for ${username}: ${e}`);
      });
      console.log(`New timesheet successfully created for ${username}: ${newYearTimesheet}`);
      // ***** Create newYearTimesheet ******

    }
  }
  // If the try statement fails print out the error
  catch (error) {
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}

class DayTimesheet {
  constructor(day) {
    this.day = day;
    this.totalHours = 0;
    this.sessions = [];
  }
}
class MonthTimesheet {
  constructor(month) {
    this.month = month;
    this.totalHours = 0;
    this.days = [];
  }
}
const activeSessions = {};

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
    if (newState.channelId == voiceChannelId) {
      // User joins channel check if a timesheet exists

      clockIn(true, usernameId, username, arizonaDate);

      client.channels.cache.get(timesheetChannelId).send(
          `[Join] <@${usernameId}> has joined ${newState.channel.name} - ${arizonaDate.toLocaleString()}`
        );
    } 

    // USER LEAVES VOICE CHAT
    else if (oldState.channelId == voiceChannelId) {

      clockOut(usernameId, arizonaDate, query, username, false);

    }
  }
};
