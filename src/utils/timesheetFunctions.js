const { get } = require("mongoose");
const { Timesheet, MonthTimesheet, DayTimesheet, SessionTimesheet } = require("../models/Timesheet");


let clockedInEmployees = {};

// Discord Functions. All of these return strings that can be sent as messages to the user.
function clockIn(employeeID, employeeName, timeIn, project = null) {
  console.log(`\nCLOCK IN FUNCTION`);
  const employeeInfo = getClockedInEmployeeInfo(employeeID);

  if (!employeeInfo) {
    clockedInEmployees[employeeID] = {};
    clockedInEmployees[employeeID].employeeID = employeeID;
    clockedInEmployees[employeeID].name = employeeName;
    clockedInEmployees[employeeID].timeIn = timeIn;
    clockedInEmployees[employeeID].projectsWorkedOn = new Map();

    // If a project is specified, add it to the employee's projectsWorkedOn map
    if (project) {
      clockedInEmployees[employeeID].projectStartTime = timeIn;
      clockedInEmployees[employeeID].activeProject = project;
      clockedInEmployees[employeeID].projectsWorkedOn.set(project, 0);

      clockedInEmployees[employeeID].projectsWorkedOn.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
      return `You have clocked in at ${timeIn.toLocaleString()} and are working on ${project}`;
    }


    return `You have clocked in at ${timeIn.toLocaleString()}`;
  }
  else {
    console.log(`Error: Employee is already clocked in.`);
    return `You are already clocked in at ${employeeInfo.timeIn.toLocaleString()}`;
  }

}


async function clockOut(employeeID, timeOut) {
  console.log(`\nCLOCK OUT`);

  const employeeInfo = getClockedInEmployeeInfo(employeeID);
  if (!employeeInfo) return `You are not clocked in.`;

  employeeInfo.timeOut = timeOut;

  const hoursWorked = calculateHoursWorked(employeeInfo.timeIn, timeOut);

  // Update the projectsWorkedOn map
  setActiveProject(employeeID, null);

  const sessionTimesheet = createNewSessionTimesheet(employeeInfo);

  await updateTimesheet(sessionTimesheet, employeeID);

  delete clockedInEmployees[employeeID];

  return `You have clocked out at ${timeOut.toLocaleString()}. You worked ${hoursWorked} hours.`

}

async function cancelClockIn(employeeID) {
  if (!getClockedInEmployeeInfo(employeeID)) return false;

  delete clockedInEmployees[employeeID];
  return true;
}


function calculateHoursWorked(timeIn, timeOut) {
  const millisecondsWorked = timeOut - timeIn;
  const hoursWorked = millisecondsWorked / (1000 * 60 * 60);
  return parseFloat(hoursWorked.toFixed(3));
}


function setActiveProject(employeeID, newActiveProject) {
  console.log(`\nSET ACTIVE PROJECT FUNCTION`);
  let employeeInfo = getClockedInEmployeeInfo(employeeID);

  if (!employeeInfo) return `You are not clocked in.`;

  if (employeeInfo.activeProject == newActiveProject) return `You are already working on ${newActiveProject}.`;

  if (employeeInfo.activeProject) {

    let previousActiveProject = employeeInfo.activeProject;

    // Add the hours worked on the previous project to the projectsWorkedOn map
    const hoursWorked = calculateHoursWorked(employeeInfo.projectStartTime, new Date());
    const currentHoursWorked = employeeInfo.projectsWorkedOn.get(previousActiveProject);
    const totalHoursWorked = currentHoursWorked + hoursWorked;
    employeeInfo.projectsWorkedOn.set(previousActiveProject, totalHoursWorked);

    // check if newActiveProject is null
    if (!newActiveProject || newActiveProject == "null" || newActiveProject == "none") {
      employeeInfo.activeProject = null;
      employeeInfo.projectStartTime = null;

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
    employeeInfo.projectStartTime = new Date();

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
      employeeInfo.projectStartTime = null;
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
    employeeInfo.projectStartTime = new Date();

    // print out the projectsWorkedOn map
    employeeInfo.projectsWorkedOn.forEach((value, key) => {
      console.log(`Key: ${key}, Value: ${value}`);
    });
    return `You are now working on ${newActiveProject}.`;
  }
}


function getClockedInEmployeeInfo(employeeID) {
  console.log(`\nGET CLOCKED IN EMPLOYEE INFO FUNCTION`);

  if (!clockedInEmployees[employeeID]) {
    console.log(`Employee is not clocked in.`);
    return null;
  }

  return clockedInEmployees[employeeID];
}


// Timesheet Functions
function createYearTimesheet(employeeInfo, year) {
  console.log(`\nCREATE YEAR NEW TIMESHEET FUNCTION`);
  console.log(`Employee Info: ${JSON.stringify(employeeInfo)}`);

  const newYearTimesheet = new Timesheet({
    employeeID: employeeInfo.employeeID,
    name: employeeInfo.name,
    year: employeeInfo.timeIn.getFullYear(),
    totalHours: parseFloat(0),
    lastOnline: new Date().toLocaleString("en-US", {
      timeZone: "America/Phoenix",
    }),
    months: [],
    projects: [],
    activeProject: "",
  });


  return newYearTimesheet;
}


function createNewMonthTimesheet(month) {
  console.log(`\nCREATE NEW MONTH TIMESHEET FUNCTION`);

  const newMonthTimesheet = new MonthTimesheet({
    month: month,
    totalHours: 0,
    days: [],
  });

  return newMonthTimesheet;
}


function createNewDayTimesheet(day) {
  console.log(`\nCREATE NEW DAY TIMESHEET FUNCTION`);

  const newDayTimesheet = new DayTimesheet({
    day: day,
    totalHours: 0,
    sessions: [],
  });

  return newDayTimesheet;
}


function createNewSessionTimesheet(employeeInfo) {
  console.log(`\nCREATE NEW SESSION TIMESHEET`);

  const totalHours = calculateHoursWorked(employeeInfo.timeIn, employeeInfo.timeOut);

  let projectArray;

  if (employeeInfo.projectsWorkedOn) {
    projectArray = Array.from(employeeInfo.projectsWorkedOn).map(([projectName, totalHours]) => {
      return { name: projectName, totalHours };
    });
  }

  console.log(`projects: ${JSON.stringify(projectArray)}`);

  return new SessionTimesheet({
    timeIn: employeeInfo.timeIn.toLocaleString(),
    timeOut: employeeInfo.timeOut.toLocaleString(),
    totalHours: totalHours,
    projectsWorkedOn: projectArray, // Now projects is accessible here
  });

}


// Database Functions
async function getYearTimesheet(employeeID, year) {
  console.log(`\nGET YEAR TIMESHEET FUNCTION`);

  let query = {
    employeeID: employeeID,
    year: year,
  }

  let yearTimesheet = await Timesheet.findOne(query);

  if (!yearTimesheet) return null;
  else return yearTimesheet;
}


async function getMonthTimesheet(employeeID, year, monthNumber) {
  console.log(`\nGET MONTH TIMESHEET FUNCTION`);

  let invalidMonthNumber = (monthNumber < 1 || monthNumber > 12);
  if (invalidMonthNumber) {
    console.log(`Error: Invalid month number.`);
    return null;
  }

  let query = {
    employeeID: employeeID,
    year: year,
    "months.month": monthNumber,
  }

  let monthTimesheet = await Timesheet.findOne(query);

  if (!monthTimesheet) {
    return null;
  }
  else {
    monthTimesheet = monthTimesheet.months.find((m) => m.month === monthNumber);
    return monthTimesheet;
  }



}


async function getDayTimesheet(employeeID, year, monthNumber, day) {
  console.log(`\nGET DAY TIMESHEET FUNCTION`);

  let invalidMonthNumber = (monthNumber < 1 || monthNumber > 12);
  let invalidDay = (day < 1 || day > new Date(year, monthNumber, 0).getDate());

  if (invalidMonthNumber) {
    console.log(`Error: Invalid month number.`);
    return null;
  }
  if (invalidDay) {
    console.log(`Error: Invalid day.`);
    return null;
  }

  let query = {
    employeeID: employeeID,
    year: year,
    "months.month": monthNumber,
    "months.days.day": day,
  }

  let dayTimesheet = await Timesheet.findOne(query);

  if (!dayTimesheet) {
    return null;
  }
  else {
    dayTimesheet = dayTimesheet.months.find((m) => m.month === monthNumber).days.find((d) => d.day === day);
    return dayTimesheet;
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


async function updateTimesheet(shiftTimesheet, employeeID) {
  console.log(`\nSAVE SHIFT TO DATABASE FUNCTION`);

  let employeeInfo = getClockedInEmployeeInfo(employeeID);
  let year = employeeInfo.timeIn.getFullYear();
  let month = employeeInfo.timeIn.getMonth() + 1;
  let day = employeeInfo.timeIn.getDate();

  let yearTimesheet = await getYearTimesheet(employeeID, year);
  let monthTimesheet = yearTimesheet?.months.find((m) => m.month === month);
  let dayTimesheet = monthTimesheet?.days.find((d) => d.day === day);

  console.log(`shift timesheet total hours: ${shiftTimesheet?.totalHours}`);
  console.log(`year timesheet total hours: ${yearTimesheet?.totalHours}`);

  if (!yearTimesheet) {

    yearTimesheet = createYearTimesheet(employeeInfo, year);
    monthTimesheet = createNewMonthTimesheet(month);
    dayTimesheet = createNewDayTimesheet(day);

    yearTimesheet.totalHours += shiftTimesheet.totalHours;
    monthTimesheet.totalHours += shiftTimesheet.totalHours;
    dayTimesheet.totalHours += shiftTimesheet.totalHours;

    dayTimesheet.sessions.push(shiftTimesheet);
    monthTimesheet.days.push(dayTimesheet);
    yearTimesheet.months.push(monthTimesheet);

  }
  else {

    yearTimesheet.totalHours += shiftTimesheet.totalHours;

    if (!monthTimesheet) {

      monthTimesheet = createNewMonthTimesheet(month);
      dayTimesheet = createNewDayTimesheet(day);

      dayTimesheet.totalHours += shiftTimesheet.totalHours;
      monthTimesheet.totalHours += shiftTimesheet.totalHours;

      dayTimesheet.sessions.push(shiftTimesheet);
      monthTimesheet.days.push(dayTimesheet);
      yearTimesheet.months.push(monthTimesheet);

    }
    else {
      monthTimesheet.totalHours += shiftTimesheet.totalHours;

      if (!dayTimesheet) {
        dayTimesheet = createNewDayTimesheet(day);
        dayTimesheet.totalHours += shiftTimesheet.totalHours;
        dayTimesheet.sessions.push(shiftTimesheet);
        monthTimesheet.days.push(dayTimesheet);
      }
      else {
        dayTimesheet.totalHours += shiftTimesheet.totalHours;
        dayTimesheet.sessions.push(shiftTimesheet);
      }

    }

  }
  // Update Projects
  let projectsWorkedOn = shiftTimesheet.projectsWorkedOn;
  projectsWorkedOn.forEach((project) => {
    let projectIndex = yearTimesheet.projects.findIndex((p) => p.name.toLowerCase() === project.name.toLowerCase());
    if (projectIndex === -1) {
      yearTimesheet.projects.push({
        name: project.name,
        creationDate: new Date().toLocaleString(),
        lastWorkedDate: new Date().toLocaleString(),
        totalTime: project.totalHours,
      });
    }
    else {
      yearTimesheet.projects[projectIndex].totalTime += project.totalHours;
      yearTimesheet.projects[projectIndex].lastWorkedDate = new Date().toLocaleString();
    }

  });

  yearTimesheet.lastOnline = new Date().toLocaleString();

  await yearTimesheet.save();
  console.log(`Saved shift to database`);
}


async function test() {
  console.log(`\nTEST FUNCTION`);

  let year = 2023;
  let month = 10; // The specific month you want to search in
  let day = 22;   // The specific day you want to search for
  let employeeID = 123;
  let employeeName = "Test";

  clockIn(employeeID, employeeName, new Date(), "Project 1");
  let employeeInfo = getClockedInEmployeeInfo(employeeID);



  // let timesheet = await getDayTimesheet(employeeID, year, month, day);

  let timesheet = await getYearTimesheet(employeeID, year);
  console.log(`Did ${timesheet ? "not " : ""}find timesheet`)

  console.log(`timesheet ${timesheet ? "found" : "not found"}`);
  if (!timesheet) {

    timesheet = createYearTimesheet(employeeInfo, year);
    console.log(`Created new year timesheet: ${JSON.stringify(timesheet)}`);

    timesheet.totalHours += 1;

    timesheet.save();
    return;
  }

  console.log(`Year Timesheet: ${JSON.stringify(timesheet)}`);

  timesheet.totalHours += 1;
  timesheet.save();
  return;
}


module.exports = {
  clockIn,
  clockOut,
  cancelClockIn,
  setActiveProject,
  getClockedInEmployeeInfo,
  getYearTimesheet,
  getMonthTimesheet,
  getDayTimesheet,
  getHours,
  getYearHours,
  getMonthHours,
  getDayHours,
  updateTimesheet,
  test,
} 