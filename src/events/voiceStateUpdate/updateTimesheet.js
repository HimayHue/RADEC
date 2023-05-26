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

// Clock In

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


function clockOut(usernameId, timeOut, addHoursToCorrectDates /** @type {boolean} */) {

  if (addHoursToCorrectDates && (activeSessions[usernameId].timeIn.getDate() != timeOut.getDate())) {
    // CASE: users works into a new month
    // CASE: user works into a new year
    // CASE: user works into a new day
  }
  // adds the total hours worked to the date of timeIn
  else { 
    activeSessions[usernameId].timeOut = timeOut;
    activeSessions[usernameId].totalHours =
        (
          (activeSessions[usernameId].timeOut - activeSessions[usernameId].timeIn) / (1000 * 60 * 60)
        )
        .toFixed(3);
    console.log(`\nUser is clocking out`)
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)}`)
    // TODO update timesheet

    delete activeSessions[usernameId];
    console.log(`\nUser clocked out and session deleted`)
    console.log(`ACTIVE SESSIONS: ${JSON.stringify(activeSessions)} \n`)

  }
}

// Store user join times
const activeSessions = {};
const dayTimesheets = {};

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
  const currentArizonaMonth = arizonaDate.getMonth() + 1; // [1-12] isntead of [0-11]
  const currentArizonaDay = arizonaDate.getDate();
  const currentWeekday = arizonaDate.getDay();
  
  console.log(`AZ Time: ${arizonaDate}`);

  const query = {
    employeeID: usernameId,
    year: currentArizonaYear,
  };


  if (newState.member.roles.cache.has(roleRequiredId)) {
    if (newState.channelId == voiceChannelId) {
      // User joins channel check if a timesheet exists

      clockIn(true, usernameId, username, arizonaDate);

      /*
      try {
        // pull the players Timesheet from database
        const timesheet = await Timesheet.findOne(query);

        // objective of this if statement is to pull the current dayTimesheet or create one if needed
        if (timesheet) {
          console.log(`\n Timesheet for ${username} found \n`);
          // check if the months array has a month object of the current month
          const monthTimesheet = timesheet.months.find((month) => month.month === currentArizonaMonth);
          console.log(`Months Array: ${JSON.stringify(timesheet.months)}`);


          
          if (monthTimesheet) {
            console.log(`Month Timesheet for month ${monthTimesheet.month} for ${username} found`)
            const monthIndex = timesheet.months.findIndex((month) => month.month === currentArizonaMonth);
            console.log(`Month array index: ${monthIndex} \n`);
            
            const dayTimesheet = monthTimesheet.days.find((day) => day.day === currentArizonaDay);

            // if there a dayTimesheet
            if (dayTimesheet) {
              console.log(`Day Timesheet ${dayTimesheet.day} for ${username} found for ${currentArizonaMonth}-${currentArizonaDay} \n`)
              timesheet[usernameId] = dayTimesheet;
            } 
            // if there is no dayTimesheet
            else {
              console.log(`Day Timesheet for ${username} for ${currentArizonaMonth}-${currentArizonaDay} not found`)
              dayTimesheets[usernameId] = {
                day: currentArizonaDay,
                totalHours: 0,
                sessions: [],
              }
              console.log(`Created new dayTimesheet for ${username} for ${currentArizonaMonth}-${currentArizonaDay}`)
              try {
                timesheet.months[monthIndex].days.push(dayTimesheets[usernameId]);
                console.log(`${username}'s current month (${currentArizonaMonth}) Days[] Array: ${JSON.stringify(timesheet.months[monthIndex].days)}`);
                await timesheet.save();
                console.log(`Added day to timesheet successfully\n`);
              } catch (e) {
                console.log(`error pushing day to current month ${e}`);
              }
              
            }

          }
          // if there isnt a timesheet for this month make one with current day
          else {
            console.log(`Month Timesheet for ${username} NOT found`)
            // create timesheet for today
            const newDayTimesheet = {
              day: currentArizonaDay,
              totalHours: 0,
              sessions: [],
            }

            console.log(`New dayTimesheet created`);

            dayTimesheets[usernameId] = newDayTimesheet;
            
            // create timesheet for the month
            const newMonthTimesheet = {
              month: currentArizonaMonth,
              totalHours: 0,
              days: [newDayTimesheet],
            }

            console.log(`New monthTimesheet created`);


            // upload newMonth to the months array in the database
            timesheet.months.push(newMonthTimesheet);
            await timesheet.save();
          }
        } 
        // if there isnt a timesheet for the user at all make one
        else {
          console.log(`No Timesheet for ${username} exists. Creating one...`)
          const newDay = {
            day: currentArizonaDay,
            totalHours: 0,
            sessions: [],
          };
    
          const newMonth = {
            month: currentArizonaMonth, // Example month value (1-12)
            totalHours: 0,
            days: [newDay],
          };
    
          const newTimesheet = new Timesheet({
            employeeID: query.employeeID,
            name: username,
            year: query.year,
            totalHours: 0,
            months: [newMonth], // Assign the array with newMonth to months property
            projects: [],
          });

          await newTimesheet.save().catch((e) => {
            console.log(`Error creating new timesheet for ${username}: ${e}`);
          });
          console.log(`New timesheet successfully created for ${username}: ${newTimesheet}`);

        }
      } catch (error) {
        console.log(`Error updating timesheet: ${error} for ${username}`);
      }

      */

      client.channels.cache.get(timesheetChannelId).send(
          `[Join] <@${usernameId}> has joined ${newState.channel.name} - ${arizonaDate.toLocaleString()}`
        );
    } 

    // USER LEAVES VOICE CHAT
    else if (oldState.channelId == voiceChannelId) {

      clockOut(usernameId, arizonaDate, false);

      /*
      activeSessions[usernameId].timeOut = arizonaDate;
      activeSessions[usernameId].totalHours =
        ((activeSessions[usernameId].timeOut -
          activeSessions[usernameId].timeIn) /
        (1000 * 60 * 60)).toFixed(3);

      client.channels.cache
        .get(timesheetChannelId).send(
          `[Left] <@${usernameId}> has left ${oldState.channel.name} - ${arizonaDate.toLocaleString()}. 
          Duration: ${activeSessions[usernameId].totalHours} Hours.`
        );

        // add the session to the dayTimesheet 
        dayTimesheets[usernameId].sessions.push(activeSessions[usernameId]);
        dayTimesheets[usernameId].totalHours += activeSessions[usernameId].totalHours;
        console.log(`Successfully added session to current day ${JSON.stringify(dayTimesheets[usernameId])}`);
        // push the updated dayTimesheet to the database
        */

    }
  }
};
