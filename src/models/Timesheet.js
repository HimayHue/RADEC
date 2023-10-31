const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    name: String,
    totalHours: Number,
  }
);

const sessionTimesheetSchema = new Schema(
  {
    timeIn: String,
    timeOut: String,
    totalHours: Number,
    projectsWorkedOn: [projectSchema],
  }
);

const dayTimesheetSchema = new Schema(
  {
    day: Number,
    totalHours: Number,
    sessions: [sessionTimesheetSchema],
  }
);

const monthTimesheetSchema = new Schema(
  {
    month: Number,
    totalHours: Number,
    days: [dayTimesheetSchema],
  }
);

const yearTimesheetSchema = new Schema(
  {
    employeeID: String,
    employeeName: String,
    year: Number,
    totalHours: Number,
    lastOnline: String,
    months: [],
    projects: [],
  }
);


const timesheetSchema = new Schema(
  {
    employeeID: String,
    name: String,
    year: Number,
    totalHours: Number,
    lastOnline: String,
    months: [monthTimesheetSchema],
    projects: [
      {
        name: String,
        creationDate: String,
        lastWorkedDate: String,
        totalTime: Number,
      }
    ],
  }
);

const Timesheet = model("Timesheet", timesheetSchema);
const SessionTimesheet = model("SessionTimesheet", sessionTimesheetSchema);
const DayTimesheet = model("DayTimesheet", dayTimesheetSchema);
const MonthTimesheet = model("MonthTimesheet", monthTimesheetSchema);
const YearTimesheet = model("YearTimesheet", yearTimesheetSchema);
const Project = model("Project", projectSchema);

module.exports = {
  Timesheet,
  SessionTimesheet,
  DayTimesheet,
  MonthTimesheet,
  YearTimesheet,
  Project,
};
