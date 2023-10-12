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

  } catch (error) {

    console.error(`Error while finding Timesheet for year ${year}: ${error.message}`);
    throw error;
  }

}

async function findMonthTimesheet(employeeID, year, monthNumber) {
  try {
    let yearTimesheet = await findYearTimesheet(employeeID, year);
    let monthTimesheet = yearTimesheet.months.find((m) => m.month === monthNumber);


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
}

async function findDayTimesheet(monthTimesheet, day) {
  let dayTimesheet = monthTimesheet.days.find((d) => d.day === day);

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
    return getDayHours(employeeID, year, month, day);
  }

  if (month) {
    // get month hours
    console.log(`(getHours): Getting month hours for ${month}/${year}`)
    return getMonthHours(employeeID, year, month);
  }

  if (year) {
    // get year hours
    console.log(`(getHours): Getting year hours for ${year}`)
    return getYearHours(employeeID, year);
  }

}

// change it so that if the year is not found it returns null
async function getYearHours(employeeID, year) {
  console.log(`(getYearHours): Getting year hours for ${year}`)
  return (await findYearTimesheet(employeeID, year)).totalHours;
}

// change it so that if the month is not found it returns null
async function getMonthHours(employeeID, year, month) {
  console.log(`(getMonthHours): Getting hours for ${month}/${year}`)
  return (await findMonthTimesheet(employeeID, year, month)).totalHours;
}

// change it so that if the day is not found it returns null
async function getDayHours(employeeID, year, month, day) {
  console.log(`(getDayHours): Getting hours for ${month}/${day}/${year}`)

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