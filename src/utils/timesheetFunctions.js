const { get } = require("mongoose");
const { Timesheet, MonthTimesheet, DayTimesheet, SessionTimesheet } = require("../models/Timesheet");


let clockedInEmployees = {};

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
function clockIn(employeeID, employeeName, clockedInTime, project = null) {
  console.log(`\nCLOCK IN FUNCTION`);
  const employeeInfo = clockedInEmployees[employeeID];

  if (!employeeInfo) {
    clockedInEmployees[employeeID] = {};
    clockedInEmployees[employeeID].name = employeeName;
    clockedInEmployees[employeeID].clockedInTime = clockedInTime;
    clockedInEmployees[employeeID].projectsWorkedOn = new Map();

    // If a project is specified, add it to the employee's projectsWorkedOn map
    if (project) {
      clockedInEmployees[employeeID].projectStarted = clockedInTime;
      clockedInEmployees[employeeID].activeProject = project;
      clockedInEmployees[employeeID].projectsWorkedOn.set(project, 0);

      clockedInEmployees[employeeID].projectsWorkedOn.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
      return `You have clocked in at ${clockedInTime.toLocaleString()} and are working on ${project}`;
    }


    return `You have clocked in at ${clockedInTime.toLocaleString()}`;
  }
  else {
    console.log(`Error: Employee is already clocked in.`);
    return `You are already clocked in at ${employeeInfo.clockedInTime.toLocaleString()}`;
  }

}


async function clockOut(employeeID, clockedOutTime) {
  console.log(`\nCLOCK OUT`);
  // Check if the employee is clocked in
  const employeeInfo = clockedInEmployees[employeeID];
  if (!employeeInfo) return `You are not clocked in.`;

  // Calculate the hours worked
  const hoursWorked = calculateHoursWorked(employeeInfo.clockedInTime, clockedOutTime);

  // Update the projectsWorkedOn map
  setActiveProject(employeeID, null);

  // print out employeeInfo
  console.log(`Employee Info: ${JSON.stringify(employeeInfo)}`);

  // print out the projectsWorkedOn map
  employeeInfo.projectsWorkedOn.forEach((value, key) => {
    console.log(`Key: ${key}, Value: ${value}`);
  });

  // Create a new session timesheet
  const sessionTimesheet = createNewSessionTimesheet(employeeInfo.clockedInTime, clockedOutTime, employeeInfo);
  console.log(`Session Timesheet: ${JSON.stringify(sessionTimesheet)}`);
  console.log(`Session Timesheet projects: ${JSON.stringify(sessionTimesheet.projectsWorkedOn)}`);

  await saveShiftToDatabase(sessionTimesheet, employeeID);

  delete clockedInEmployees[employeeID];
  console.log(`Deleted employee from clockedInEmployees: ${JSON.stringify(clockedInEmployees)}`);

  return `You have clocked out at ${clockedOutTime.toLocaleString()}. You worked ${hoursWorked} hours.`

}


function calculateHoursWorked(clockIn, clockOut) {
  const millisecondsWorked = clockOut - clockIn;
  const hoursWorked = millisecondsWorked / (1000 * 60 * 60);
  return parseFloat(hoursWorked.toFixed(3));
}


function setActiveProject(employeeID, newActiveProject) {
  console.log(`\nSET ACTIVE PROJECT FUNCTION`);
  let employeeInfo = clockedInEmployees[employeeID];

  // check if employee is clocked in
  if (!employeeInfo) return `You are not clocked in.`;



  // check if employee is already working on the project
  if (employeeInfo.activeProject == newActiveProject) return `You are already working on ${newActiveProject}.`;

  // check if employee has an active project
  if (employeeInfo.activeProject) {

    let previousActiveProject = employeeInfo.activeProject;

    // Add the hours worked on the previous project to the projectsWorkedOn map
    const hoursWorked = calculateHoursWorked(employeeInfo.projectStarted, new Date());
    const currentHoursWorked = employeeInfo.projectsWorkedOn.get(employeeInfo.activeProject);
    const totalHoursWorked = currentHoursWorked + hoursWorked;
    employeeInfo.projectsWorkedOn.set(employeeInfo.activeProject, totalHoursWorked);

    // check if newActiveProject is null
    if (!newActiveProject || newActiveProject == "null" || newActiveProject == "none") {
      employeeInfo.activeProject = null;
      employeeInfo.projectStarted = null;

      // print out the projectsWorkedOn map
      employeeInfo.projectsWorkedOn.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });

      return `You are no longer working on ${previousActiveProject}. You worked ${hoursWorked} hours on ${previousActiveProject}.`;
    }

    // if newActiveProject is not in the projectsWorkedOn map, add it
    if (!employeeInfo.projectsWorkedOn.has(newActiveProject)) {
      employeeInfo.projectsWorkedOn.set(newActiveProject, 0);
    }

    employeeInfo.activeProject = newActiveProject;
    employeeInfo.projectStarted = new Date();

    // print out the projectsWorkedOn map
    employeeInfo.projectsWorkedOn.forEach((value, key) => {
      console.log(`Key: ${key}, Value: ${value}`);
    });

    return `You are now working on ${newActiveProject}. You worked ${hoursWorked} hours on ${previousActiveProject}.`;
  }
  else {
    // check if newActiveProject is null
    // This if statement should run when you clock out without having an active project
    if (!newActiveProject || newActiveProject == "null" || newActiveProject == "none") {
      employeeInfo.activeProject = null;
      employeeInfo.projectStarted = null;
      // print out the projectsWorkedOn map
      employeeInfo.projectsWorkedOn.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
      return
    }

    // if newActiveProject is not in the projectsWorkedOn map, add it
    if (!employeeInfo.projectsWorkedOn.has(newActiveProject)) {
      employeeInfo.projectsWorkedOn.set(newActiveProject, 0);
    }

    employeeInfo.activeProject = newActiveProject;
    employeeInfo.projectStarted = new Date();

    // print out the projectsWorkedOn map
    employeeInfo.projectsWorkedOn.forEach((value, key) => {
      console.log(`Key: ${key}, Value: ${value}`);
    });
    return `You are now working on ${newActiveProject}.`;
  }
}

function getEmployeeInfo(employeeID) {
  if (!clockedInEmployees[employeeID]) {
    console.log(`Error: Employee is not clocked in.`);
    return null;
  }

  return clockedInEmployees[employeeID];
}


async function createYearTimesheet(employeeID, year) {
  console.log(`\nCREATE YEAR NEW TIMESHEET FUNCTION`);

  let employeeInfo = getEmployeeInfo(employeeID);

  const newYearTimesheet = new Timesheet({
    employeeID: employeeID,
    name: employeeInfo.name,
    year: employeeInfo.clockedInTime.getFullYear(),
    totalHours: 0,
    lastOnline: new Date().toLocaleString("en-US", {
      timeZone: "America/Phoenix",
    }),
    months: [],
    projects: [],
    activeProject: "",
  });
  
  await newYearTimesheet.save();
  return newYearTimesheet;
}


async function createNewMonthTimesheet(month) {
  console.log(`\nCREATE NEW MONTH TIMESHEET FUNCTION`);
  
  const newMonthTimesheet = new MonthTimesheet({
    month: month,
    totalHours: 0,
    days: [],
  });

  return newMonthTimesheet;
}


async function createNewDayTimesheet(day) {
  console.log(`\nCREATE NEW DAY TIMESHEET FUNCTION`);
  
  const newDayTimesheet = new DayTimesheet({
    day: day,
    totalHours: 0,
    sessions: [],
  });

  return newDayTimesheet;
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

async function getYearTimesheet(employeeID, year, mustExist = false) {
  console.log(`\nGET YEAR TIMESHEET FUNCTION`);

  let yearTimesheet = await Timesheet.findOne({ employeeID: employeeID, year: year });

  if (yearTimesheet) return yearTimesheet;

  if (mustExist) {
    let newTimesheet = await createYearTimesheet(employeeID, year);
    
    return newTimesheet;
  }
  else {
    return null;
  }
}


async function getMonthTimesheet(employeeID, year, monthNumber, mustExist = false) {
  console.log(`\nGET MONTH TIMESHEET FUNCTION`);

  let yearTimesheet = await getYearTimesheet(employeeID, year, mustExist);
  if (!yearTimesheet) return null;

  let monthTimesheet = yearTimesheet.months.find((m) => m.month == monthNumber);

  if (monthTimesheet) return monthTimesheet;

  if (mustExist) {
    let newMonthTimesheet = await createNewMonthTimesheet(monthNumber);
    return newMonthTimesheet;
  }
  else {
    return null;
  }
}


async function getDayTimesheet(employeeID, year, monthNumber, day, mustExist = false) {
  console.log(`\nGET DAY TIMESHEET FUNCTION`);

  let monthTimesheet = await getMonthTimesheet(employeeID, year, monthNumber, mustExist);
  let dayTimesheet = monthTimesheet.days.find((d) => d.day == day);

  if (dayTimesheet) return dayTimesheet;

  if (mustExist) {
    let newDayTimesheet = await createNewDayTimesheet(day);
    return newDayTimesheet;
  }
  else {
    return null;
  }
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
  return (await getYearTimesheet(employeeID, year)).totalHours;
}


async function getMonthHours(employeeID, year, month) {
  // console.log(`(getMonthHours): Getting hours for ${month}/${year}`)
  return (await getMonthTimesheet(employeeID, year, month)).totalHours;
}


async function getDayHours(employeeID, year, month, day) {
  // console.log(`(getDayHours): Getting hours for ${month}/${day}/${year}`)
  return (await getDayTimesheet(employeeID, year, month, day)).totalHours;
}


async function saveShiftToDatabase(shiftTimesheet, employeeID) {
  let employeeInfo = getEmployeeInfo(employeeID);
  let year = employeeInfo.clockedInTime.getFullYear();
  let month = employeeInfo.clockedInTime.getMonth();
  let day = employeeInfo.clockedInTime.getDate();

  month = month + 1;

  console.log(`\nSAVE SHIFT TO DATABASE`);
  console.log(`Shift Timesheet: ${JSON.stringify(shiftTimesheet)}`);
  console.log(`ID: ${employeeID}`);
  console.log(`Year: ${year}`);
  console.log(`Month: ${month}`);
  console.log(`Day: ${day}`);

  let yearTimesheet = await getYearTimesheet(employeeID, year, true);
  let monthTimesheet = yearTimesheet.months.find((m) => m.month == month);
  let dayTimesheet = monthTimesheet.days.find((d) => d.day == day);

  dayTimesheet.sessions.push(shiftTimesheet);
  dayTimesheet.totalHours += shiftTimesheet.totalHours;
  monthTimesheet.totalHours += shiftTimesheet.totalHours;
  yearTimesheet.totalHours += shiftTimesheet.totalHours;

  await yearTimesheet.save();


  return;
}


module.exports = {
  employeesInfo: clockedInEmployees,
  clockIn,
  clockOut,
  calculateHoursWorked,
  setActiveProject,
  findYearTimesheet: getYearTimesheet,
  findMonthTimesheet: getMonthTimesheet,
  findDayTimesheet: getDayTimesheet,
  getHours
} 