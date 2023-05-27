const { Schema, model } = require("mongoose");

const timesheetSchema = new Schema({
  employeeID: String,     // Unique identifier for the person
  name: String,
  year: Number,
  totalHours: Number,
  lastOnline: String,
  months: [Object],
  projects: [Object],
});

module.exports = model("Timesheet", timesheetSchema);
