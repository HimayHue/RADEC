function clockIn(employee, time) {

  console.log(`${employee} clocked in at ${time}`)
  
}

function clockOut() {
  return new Date();
}  

function calculateHoursWorked(clockIn, clockOut) {
  return clockOut - clockIn;
}

async function findYearTimesheet(query) {
  let yearTimesheet = await Timesheet.findOne(query);
  return yearTimesheet;
}

// month is inputed as 1-12
function findMonthTimesheet(month) {
  return timesheet;
}

function findDayTimesheet() {
  return timesheet;
}

function updateActiveProject() {
  return timesheet;
}

function updateHours() {

}

function getHours() {

}

module.exports = {
  clockIn,
  clockOut,
  calculateHoursWorked,
  findYearTimesheet,
  findMonthTimesheet,
  findDayTimesheet,
  updateActiveProject
} 