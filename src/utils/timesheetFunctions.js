const { get } = require("mongoose");
const { Timesheet, DayTimesheet, MonthTimesheet } = require("../models/Timesheet");

function clockIn(employee, time) {

  console.log(`${employee} clocked in at ${time}`)

}

function clockOut() {
  return new Date();
}

function calculateHoursWorked(clockIn, clockOut) {
  return clockOut - clockIn;
}

async function findYearTimesheet(employeeID, year) {
  try {
    const timesheet = await Timesheet.findOne({employeeID: employeeID, year: year});

    if (timesheet) {
      return timesheet;
    } 
    else {
      console.log(`No Timesheet found for year ${year}`);
      return null;
    }

  } catch (error) {

    console.error(`Error while finding Timesheet for year ${year}: ${error.message}`);
    throw error;
  }

}

async function findMonthTimesheet(databaseQuery, year, monthNumber) {
  try {
    const monthTimesheet = await Timesheet.findOne({employeeID: databaseQuery.employeeID, year: year, 'months.month': monthNumber });

    if (monthTimesheet) {
      return monthTimesheet;
    } 
    else {
      console.log(`No Timesheet found for month ${monthNumber}`);
      return null;
    }

    // return (monthTimesheet? monthTimesheet : null)

  }
  catch (error) {
    console.error(`Error while finding month Timesheet for ${monthNumber}/${year}: ${error.message}`);
    throw error;
  }
  

  return MonthTimesheet;
}

async function findDayTimesheet(monthTimesheet, day) {
  return DayTimesheet;
}

function updateActiveProject() {
  return timesheet;
}

function updateHours() {

}

async function getHours(day, month, year, employeeID) {
  // a possible way of doing is adding up the options (they must be assigned a value) inputed and using a switch case based on that

  if (day) {
    // get day hours
    console.log(`Getting day hours for ${month}/${day}/${year}`)

    return
  }

  if (month) {
    // get month hours
    console.log(`Getting month hours for ${month}/${year}`)
    return
  }

  if (year) {
    // get year hours
    console.log(`Getting year hours for ${year}`)
    let hours = await getYearHours(year, employeeID);
    return hours;
  }


}

async function getYearHours(year, employeeID) {
  console.log(`Getting year hours for ${year}`)
  let timesheet = await findYearTimesheet({ year: year, employeeID: employeeID });
  return timesheet.totalHours;
}

async function getMonthHours(year, month) {
  console.log(`Getting hours for ${month}/${year}`)

}

async function getDayHours(year, month, day) {
  console.log(`Getting hours for ${month}/${day}/${year}`)

}

module.exports = {
  clockIn,
  clockOut,
  calculateHoursWorked,
  findYearTimesheet,
  findMonthTimesheet,
  findDayTimesheet,
  updateActiveProject,
  getHours
} 