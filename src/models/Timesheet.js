const { Schema, model } = require("mongoose");

const sessionTimesheetSchema = new Schema({
  name: String,
  timeIn: Date,
  timeOut: Date,
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

const timesheetSchema = new Schema({
  employeeID: String,
  name: String,
  year: Number,
  totalHours: Number,
  lastOnline: String,
  months: [monthTimesheetSchema],
  projects: [Object],
});

const Timesheet = model("Timesheet", timesheetSchema);
const SessionTimesheet = model("SessionTimesheet", sessionTimesheetSchema);
const DayTimesheet = model("DayTimesheet", dayTimesheetSchema);
const MonthTimesheet = model("MonthTimesheet", monthTimesheetSchema);

module.exports = {
  Timesheet,
  SessionTimesheet,
  DayTimesheet,
  MonthTimesheet,
};
