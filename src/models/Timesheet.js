const { Schema, model } = require("mongoose");

const timesheetSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  timeMessageSent: {
    type: Date,
    required: true,
  },
});

module.exports = model("Timesheet", timesheetSchema);
