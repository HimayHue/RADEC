const { get } = require("mongoose");
const { Timesheet, MonthTimesheet, dayTimesheet, SessionTimesheet } = require("../models/Timesheet");


let employeesInfo = {};

/* Example of employeesInfo
{
  himay: {
    employeeID: 1234567890,
    clockedInTime: 2021-09-04T22:00:00.000Z
    clockedOutTime: 2021-09-04T23:00:00.000Z
    projectStarted: 2021-09-04T22:00:00.000Z
    activeProject: "project1",
    projectsWorkedOn: [
      {
        name: "project1",
        hoursWorked: 1,
      },
      {
        name: "project2",
        hoursWorked: 2,
      },
    ]
  }
}
*/

/* ****************
 * 
 * TIMESHEET FUNCTIONS
 * 
 * These functions are used to manipulate the timesheet
 * 
 * ***************/

// Make clockIn and clockOut check if the employee is already clocked in or out
function clockIn(employeeName, employeeID, clockedInTime, project = null) {
  console.log(`\nCLOCK IN`);
  const employeeInfoExists = employeesInfo[employeeName];

  if (!employeeInfoExists) {
    employeesInfo[employeeName] = {};
    employeesInfo[employeeName].employeeID = employeeID;
    employeesInfo[employeeName].clockedInTime = clockedInTime;

    // If a project is specified, add it to the employee's projectsWorkedOn map
    if (project) {
      employeesInfo[employeeName].projectStarted = clockedInTime;
      employeesInfo[employeeName].activeProject = project;
      employeesInfo[employeeName].projectsWorkedOn = new Map();
      employeesInfo[employeeName].projectsWorkedOn.set(project, 0);

      employeesInfo[employeeName].projectsWorkedOn.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
    }
    

    return clockedInTime;
  }
  else if (!employeeInfoExists.clockedInTime) { // usually when you clock out the whole object is deleted
    employeesInfo[employeeName].clockedInTime = clockedInTime;
    return clockedInTime;
  }
  else {
    console.log(`Error: Employee is already clocked in.`);
    return null;
  }

}

// TODO swap parameter from employeeUsername to employeeInfo
function clockOut(employeeInfo, clockedOutTime, employeeUsername) {
  // Check if the employee is clocked in
  console.log(`\nCLOCK OUT`);

  const employeeIsClockedIn = employeeInfo && employeeInfo.clockedInTime;

  if (employeeIsClockedIn) {
    const hoursWorked = calculateHoursWorked(employeeInfo.clockedInTime, clockedOutTime);
    const clockedInTime = employeeInfo.clockedInTime;

    // Add the hours worked on the active project to the projectsWorkedOn map
    if (employeeInfo.activeProject) {
      const currentHoursWorked = employeeInfo.projectsWorkedOn.get(employeeInfo.activeProject);
      const totalHoursWorked = currentHoursWorked + hoursWorked;
      employeeInfo.projectsWorkedOn.set(employeeInfo.activeProject, totalHoursWorked);
    }

    let sessionsTimesheet = createNewSessionTimesheet(clockedInTime, clockedOutTime, employeeInfo);
    console.log(`sessionsTimesheet: ${JSON.stringify(sessionsTimesheet)}`);
    console.log(`sessionsTimesheet.projectsWorkedOn: ${JSON.stringify(sessionsTimesheet.projectsWorkedOn)}`);

    delete employeesInfo[employeeUsername];

    return {
      clockedOutTime: clockedOutTime,
      hoursWorked: hoursWorked,
    };

  }
  else {
    return null;
  }
}

function calculateHoursWorked(clockIn, clockOut) {
  const millisecondsWorked = clockOut - clockIn;
  const hoursWorked = millisecondsWorked / (1000 * 60 * 60);
  return hoursWorked.toFixed(3);
}

// Should only be called when the employee is clocked in
function setActiveProject(employeeInfo, newProject) {
  console.log(`\nSET ACTIVE PROJECT`);
  const activeProject = employeeInfo.activeProject;

  // check if employee is swithcing to the same project
  // if (activeProject === newProject) return null;

  let hoursWorked;

  // Add the hours worked on the previous project to the projectsWorkedOn map
  if (activeProject) {
    hoursWorked = calculateHoursWorked(employeeInfo.projectStarted, new Date());
    const currentHoursWorked = employeeInfo.projectsWorkedOn.get(activeProject);
    const totalHoursWorked = currentHoursWorked + hoursWorked;
    employeeInfo.projectsWorkedOn.set(activeProject, totalHoursWorked);
  }
  if (!employeeInfo.projectsWorkedOn) employeeInfo.projectsWorkedOn = new Map();
  
  employeeInfo.activeProject = newProject;
  employeeInfo.projectStarted = new Date();
  // check if the employee has worked on the project before during this session
  if (!employeeInfo.projectsWorkedOn.has(newProject)) return hoursWorked;

  // If the employee has not worked on the project before during this session, add it to the projectsWorkedOn map
  employeeInfo.projectsWorkedOn.set(newProject, 0);

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

function createNewSessionTimesheet(timeIn, timeOut, employeeInfo) {
  console.log(`\nCREATE NEW SESSION TIMESHEET`);
  const millisecondsPerHour = 3600000; // Number of milliseconds in an hour

  const totalMilliseconds = timeOut.getTime() - timeIn.getTime();
  const totalHours = parseFloat((totalMilliseconds / millisecondsPerHour).toFixed(3));

  let projectArray;

  if (employeeInfo.projectsWorkedOn) {
    projectArray = Array.from(employeeInfo.projectsWorkedOn).map(([projectName, totalHours]) => {
      return { name: projectName, totalHours };
    });
  }

  console.log(`projects: ${JSON.stringify(projectArray)}`);

  return new SessionTimesheet({
    timeIn: timeIn.toLocaleString(),
    timeOut: timeOut.toLocaleString(),
    totalHours: parseFloat(totalHours),
    projectsWorkedOn: projectArray, // Now projects is accessible here
  });

}

/* ****************
 * 
 * DATABASE FUNCTIONS
 *
 * All of these functions communicate with the database
 * 
 * ****************/

async function findYearTimesheet(employeeID, year, mustExist = false) {
  try {
    let yearTimesheet = await Timesheet.findOne({ employeeID: employeeID, year: year });
    if (yearTimesheet) return yearTimesheet;
  }
  catch (error) {
    if (mustExist) {
      let yearTimesheet = createYearNewTimesheet(employeeID, year);
      return yearTimesheet;
    }
    else {
      return null;
    }
  }
}

async function findMonthTimesheet(employeeID, year, monthNumber, mustExist = false) {
  try {
    let monthTimesheet = (await findYearTimesheet(employeeID, year)).months.find((m) => m.month === monthNumber);
    if (monthTimesheet) return monthTimesheet;
  }
  catch (error) {
    if (mustExist) {
      let monthTimesheet = createNewMonthTimesheet(monthNumber);
      return monthTimesheet;
    }
    else {
      return null;
    }
  }
}

async function findDayTimesheet(employeeID, year, monthNumber, day, mustExist = false) {
  try {
    let dayTimesheet = (await findMonthTimesheet(employeeID, year, monthNumber)).days.find((d) => d.day == day);
    if (dayTimesheet) return dayTimesheet;
  }
  catch (error) {
    if (mustExist) {
      let dayTimesheet = createNewDayTimesheet(day);
      return dayTimesheet;
    }
    else {
      return null;
    }
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
  setActiveProject,
  findYearTimesheet,
  findMonthTimesheet,
  findDayTimesheet,
  updateActiveProject,
  getHours
} 