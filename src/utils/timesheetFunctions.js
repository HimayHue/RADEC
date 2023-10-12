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

async function findDayTimesheet(employeeID, year, monthNumber, day) {

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

function updateHours() {

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