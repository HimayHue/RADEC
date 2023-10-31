require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");
// const { calculateDuration: calculateSession } = require('./events/Timesheet/calculateSession.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
}); 

// Calculate Session Duration

const radecOfficeVoiceID = process.env.RADEC_OFFICE_VOICE_ID; // Replace SPECIFIC_CHANNEL_ID with the ID of the specific voice channel
const timesheetTextChannelID = process.env.RTIMESHEET_TEXT_CHANNEL_ID; // Replace TEXT_CHANNEL_ID with the ID of the specific text channel
const radecRole = process.env.RADEC_ROLE_ID; // Replace REQUIRED_ROLE_ID with the ID of the specific role

// TODO: Does this apply to individual users or everyone?
let timeIn;
let timeOut;


(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect("mongodb+srv://himayradec:UDRll2qTTTEieEtP@radec.xwhrkef.mongodb.net/RADEC", { keepAlive: true });
    console.log("Connected to Mongo Database.");

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})(); 