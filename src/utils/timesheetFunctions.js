function clockIn(employee, time) {

  console.log(`${employee} clocked in at ${time}`)
  
}

function clockOut() {
  return new Date();
}  

function calculateHoursWorked(clockIn, clockOut) {
  return clockOut - clockIn;
}

function findYearTimesheet() {
  return timesheet;
}

function findMonthTimesheet() {
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