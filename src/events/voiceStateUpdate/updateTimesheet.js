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
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)} \n`);
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
    
    console.log(`\nUser is clocking out`);
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)}`);
    
    
    await updateTimesheet(activeSessions[usernameId], query, username);
    
    delete activeSessions[usernameId];
    console.log(`\nUser clocked out and session deleted`)
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)} \n`)
    
  }
}

async function updateTimesheet(session, query, username){
  try {
    let yearTimesheet = await Timesheet.findOne(query);
    console.log(`\nTimesheet for ${username} was ${yearTimesheet ? '' : 'NOT '}found`);
    console.log(`Timesheet for ${username}: ${JSON.stringify(yearTimesheet)}`);
    
    if (yearTimesheet) {
      yearTimesheet.lastOnline = session.timeOut.toLocaleString();
      
      console.log(`\nMonths Array: ${JSON.stringify(yearTimesheet.months)}`);
      console.log(`Searching for Month ${session.timeIn.getMonth() + 1}`);
      const monthIndex = yearTimesheet.months.findIndex((month) => month.month === (session.timeIn.getMonth()) + 1); // +1 because getMonth() returns 0-11
      console.log(`Month Timesheet for ${username} was ${(monthIndex != -1) ? '' : 'NOT '}found: ${monthIndex}`);
      
      if (monthIndex != -1) { // -1 means the month was not found
        console.log(`\nDays Array: ${JSON.stringify(yearTimesheet.months[monthIndex].days)}`);
        console.log(`Searching for Day ${session.timeIn.getDate()}`);
        const dayIndex = yearTimesheet.months[monthIndex].days.findIndex((day) => day.day === session.timeIn.getDate());
        console.log(`Day Timesheet for ${username} was ${(dayIndex!=  -1) ? '' : 'NOT '}found: ${dayIndex}`);

        if (dayIndex!= -1) {
          // Add `session` to the dayTimesheet
          console.log(`Day Timesheet for ${username}: ${JSON.stringify(yearTimesheet.months[monthIndex].days[dayIndex])}`);
          
          // ***** updateTimesheetHours ***** 
          yearTimesheet.months[monthIndex].days[dayIndex].totalHours += session.totalHours;
          yearTimesheet.months[monthIndex].totalHours += session.totalHours;
          yearTimesheet.totalHours += session.totalHours;
          console.log(`\nUpdated Hours. \nDay: ${yearTimesheet.months[monthIndex].days[dayIndex].totalHours} \nMonth: ${yearTimesheet.months[monthIndex].totalHours} \nYear: ${yearTimesheet.totalHours} `)
          // ***** updateTimesheetHours ***** 
          
          session.timeIn = session.timeIn.toLocaleString('en-US', { timeZone: 'America/Phoenix' });
          session.timeOut = session.timeOut.toLocaleString('en-US', { timeZone: 'America/Phoenix' });

          yearTimesheet.months[monthIndex].days[dayIndex].sessions.push(session);
          console.log(`\nUpdated Day Timesheet for ${username}: ${JSON.stringify(yearTimesheet.months[monthIndex].days[dayIndex])}`);

          yearTimesheet.months[monthIndex].markModified('days'); // Mark the 'days' array as modified
          yearTimesheet.markModified('months'); // Mark the 'months' array as modified

          
          try {
            await yearTimesheet.save();
            console.log(`\nUpdated timesheet for ${username}`);
            console.log(`Year Timesheet: ${JSON.stringify(yearTimesheet)}`);
          } catch (error) {
            console.log(`Error updating timesheet: ${error} for ${username}`);
          }

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

        const newMonthTimesheet = new MonthTimesheet(session.timeIn.getMonth() +1)
        newMonthTimesheet.days.push(newDayTimesheet); 
        console.log(`Created new Month Timesheet for ${username}: ${JSON.stringify(newMonthTimesheet)}`);

      }
    }
    else {

      // Create the 3 timesheets
      yearTimesheet = createNewYearTimesheet(query, username);
      const monthTimesheet = new MonthTimesheet(session.timeIn.getMonth() + 1) // +1 because getMonth() returns 0-11
      const dayTimesheet = new DayTimesheet(session.timeIn.getDate())

      session.timeIn = session.timeIn.toLocaleString('en-US', { timeZone: 'America/Phoenix' });
      session.timeOut = session.timeOut.toLocaleString('en-US', { timeZone: 'America/Phoenix' });

      
      // Push objects into timesheets
      dayTimesheet.sessions.push(session);
      monthTimesheet.days.push(dayTimesheet);
      yearTimesheet.months.push(monthTimesheet);
      
      
      // ***** updateTimesheetHours ***** 
      dayTimesheet.totalHours += session.totalHours;
      monthTimesheet.totalHours += session.totalHours;
      yearTimesheet.totalHours += session.totalHours;
      // ***** updateTimesheetHours ***** 
      
      console.log(`\nUpdated Hours for timesheets \nYear: ${yearTimesheet.totalHours}\nMonth: ${monthTimesheet.totalHours}\nDay ${dayTimesheet.totalHours}`);
      
      console.log(`Created new Day Timesheet for ${username}: ${JSON.stringify(dayTimesheet)}`);
      console.log(`Created new Month Timesheet for ${username}: ${JSON.stringify(monthTimesheet)}`);

      await yearTimesheet.save().catch((e) => {
        console.log(`Error creating new timesheet for ${username}: ${e}`);
      });
      console.log(`Created new Year Timesheet for ${username}: ${yearTimesheet}`);
      // ***** Create newYearTimesheet ******

    }
  }
  // If the try statement fails print out the error
  catch (error) {
    console.log(`Error updating timesheet: ${error} for ${username}`);
  }
}

function createNewYearTimesheet(query, username, session) {
  return new Timesheet({
    employeeID: query.employeeID,
    name: username,
    year: query.year,
    totalHours: 0,
    lastOnline: new Date().toLocaleString(),
    months: [], // Assign the array with newMonth to months property
    projects: [],
  });
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
    if (newState.channelId == voiceChannelId) {  //TODO: Set a bool variable named clockedIn
      // User joins channel check if a timesheet exists

      clockIn(true, usernameId, username, arizonaDate);

      client.channels.cache.get(timesheetChannelId).send(
          `[Join] <@${usernameId}> has joined ${newState.channel.name} - ${arizonaDate.toLocaleString()}`
        );
    } 

    // USER LEAVES VOICE CHAT
    else if (oldState.channelId == voiceChannelId) { //TODO: Set a bool variable named clockedOut

      clockOut(usernameId, arizonaDate, query, username, false);

      client.channels.cache.get(timesheetChannelId).send(
        `[Left] <@${usernameId}> has Left ${oldState.channel.name} - ${arizonaDate.toLocaleString()}`
      );
    }
  }
};
