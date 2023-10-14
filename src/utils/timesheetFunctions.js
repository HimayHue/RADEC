const { get } = require("mongoose");
const { Timesheet, DayTimesheet, MonthTimesheet } = require("../models/Timesheet");


let employeesInfo = {};

/* Example of employeesInfo
{
  himay: {
    clockedInTime: 2021-09-04T22:00:00.000Z
    clockedOutTime: 2021-09-04T23:00:00.000Z
    activeProject: "Project 1"
  }
}
*/

/* ****************
 * 
 * TIMESHEET FUNCTIONS
 * S
 * These functions are used to manipulate the timesheet
 * 
 * ***************/

// Make clockIn and clockOut check if the employee is already clocked in or out
function clockIn(name, employeeID, clockedInTime) {
  // Check if you are already clocked in do not clock in again
  if (!employeesInfo[name]) {
    employeesInfo[name] = {};
    employeesInfo[name].employeeID = employeeID;
    employeesInfo[name].clockedInTime = clockedInTime;

    return clockedInTime;
  }
  else if (!employeesInfo[name].clockedInTime) { // usually when you clock out the whole object is deleted
    employeesInfo[name].clockedInTime = clockedInTime;
    return clockedInTime;
  }
  else {
      console.log(`Error: Employee is already clocked in.`);
      return null;
  }

}

function clockOut(employee, clockedOutTime) {
  // Check if the employee is clocked in
  console.log(`ran clockOut for ${employee}`);
  if (employeesInfo[employee] && employeesInfo[employee].clockedInTime) {

    const hoursWorked = calculateHoursWorked(employeesInfo[employee].clockedInTime, clockedOutTime);
    employeesInfo[employee] = { clockedInTime: null };

    return {
      clockedOutTime: clockedOutTime,
      hoursWorked: hoursWorked.toFixed(3),
    };

  }
  else {
    return null;
  }
}

function calculateHoursWorked(clockIn, clockOut) {
  const millisecondsWorked = clockOut - clockIn;
  const hoursWorked = millisecondsWorked / (1000 * 60 * 60); // Convert milliseconds to hours
  return hoursWorked;
}

function createYearNewTimesheet(employeeInfo) {
  return new Timesheet({
    employeeID: employeeInfo.username,
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

function createNewMonthTimesheet(month) {
  return new MonthTimesheet({
    month: month,
    totalHours: 0,
    days: [],
  });
}

function createNewDayTimesheet(day) {
  return new DayTimesheet({
    day: day,
    totalHours: 0,
    sessions: [],
  });
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

/* ****************
 * 
 * DATABASE FUNCTIONS
 *
 * All of these functions communicate with the database
 * 
 * ****************/

async function findYearTimesheet(employeeID, year) {
  try {
    const timesheet = await Timesheet.findOne({ employeeID: employeeID, year: year });

    if (timesheet) {
      return timesheet;
    }

  } catch (error) {

    console.error(`Error while finding Timesheet for year ${year}: ${error.message}`);
    throw error;
  }

}

async function findMonthTimesheet(employeeID, year, monthNumber) {
  try {
    let monthTimesheet = (await findYearTimesheet(employeeID, year)).months.find((m) => m.month === monthNumber);

    if (monthTimesheet) {
      return monthTimesheet;
    }
    else { // should not run becase it will throw an error???
      // console.log(`No Timesheet found for month ${monthNumber}`);
      return null;
    }

    // return (monthTimesheet? monthTimesheet : null)

  }
  catch (error) {
    // console.error(`Error while finding month Timesheet for ${monthNumber}/${year}: ${error.message}`);
    throw error;
  }
}

async function findDayTimesheet(employeeID, year, monthNumber, day, mustExist = false) {

  try {

    let dayTimesheet = (await findMonthTimesheet(employeeID, year, monthNumber)).days.find((d) => d.day == day);

    if (dayTimesheet) {
      return dayTimesheet;
    }
    else { // should not run becase it will throw an error???
      // console.log(`(findDayTimesheet) No Timesheet found for day ${day}`);
      return null;
    }

  }
  catch (error) {
    // console.error(`Error while finding day Timesheet for ${monthNumber}/${day}/${year}: ${error.message}`);
    throw error;
  }


}

function updateActiveProject() {
  return timesheet;
}

async function getHours(day, month, year, employeeID) {
  // a possible way of doing is adding up the options (they must be assigned a value) inputed and using a switch case based on that

  if (day) {
    // get day hours
    // console.log(`Getting day hours for ${month}/${day}/${year}`)
    return getDayHours(employeeID, year, month, day);
  }

  if (month) {
    // get month hours
    // console.log(`(getHours): Getting month hours for ${month}/${year}`)
    return getMonthHours(employeeID, year, month);
  }

  if (year) {
    // get year hours
    // console.log(`(getHours): Getting year hours for ${year}`)
    return getYearHours(employeeID, year);
  }

}

async function getYearHours(employeeID, year) {
  // console.log(`(getYearHours): Getting year hours for ${year}`)
  return (await findYearTimesheet(employeeID, year)).totalHours;
}

async function getMonthHours(employeeID, year, month) {
  // console.log(`(getMonthHours): Getting hours for ${month}/${year}`)
  return (await findMonthTimesheet(employeeID, year, month)).totalHours;
}

async function getDayHours(employeeID, year, month, day) {
  // console.log(`(getDayHours): Getting hours for ${month}/${day}/${year}`)
  return (await findDayTimesheet(employeeID, year, month, day)).totalHours;
}

async function saveShiftToDatabase(dayTimesheet, employeeShiftInfo) {

}

module.exports = {
  employeesInfo,
  clockIn,
  clockOut,
  calculateHoursWorked,
  findYearTimesheet,
  findMonthTimesheet,
  findDayTimesheet,
  updateActiveProject,
  getHours
} 