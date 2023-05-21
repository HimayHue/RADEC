const { Schema, model } = require('mongoose');

const totalMessagesSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  totalMessages: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Total Messages', totalMessagesSchema);
