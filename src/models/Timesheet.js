const { Schema, model } = require("mongoose");

const sessionTimesheetSchema = new Schema({
  timeIn: String,
  timeOut: String,
  totalHours: Number,
});

const dayTimesheetSchema = new Schema({
  day: Number,
  totalHours: Number,
  sessions: [sessionTimesheetSchema],
});

const monthTimesheetSchema = new Schema({
  month: Number,
  totalHours: Number,
  days: [dayTimesheetSchema],
});

const projectSchema = new Schema({
  name: String,
  value: Number,
});

const timesheetSchema = new Schema({
  employeeID: String,
  name: String,
  year: Number,
  totalHours: Number,
  lastOnline: String,
  months: [monthTimesheetSchema],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // Using ref to link to the Project schema
  activeProject: String,
});

const Timesheet = model("Timesheet", timesheetSchema);
const SessionTimesheet = model("SessionTimesheet", sessionTimesheetSchema);
const DayTimesheet = model("DayTimesheet", dayTimesheetSchema);
const MonthTimesheet = model("MonthTimesheet", monthTimesheetSchema);
const Project = model("Project", projectSchema);

module.exports = {
  Timesheet,
  SessionTimesheet,
  DayTimesheet,
  MonthTimesheet,
  Project,
};
