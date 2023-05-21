const { Client, VoiceState } = require("discord.js");
const Timesheet = require("../../models/Timesheet");
require("dotenv").config();

// Store user join times
const userJoinTimes = {};

/**
 * A function that handles the update of a user's timesheet based on changes in their voice state.
 * @param {Client} client The client instance (bot) that will be used to manage the Discord interactions.
 * @param {VoiceState} oldState The previous state of the user's voice connection.
 * @param {VoiceState} newState The new state of the user's voice connection.
 */
module.exports = async (client, oldState, newState) => {
  const username = newState.member.displayName;
  let roleRequiredId = process.env.RADEC_ROLE_ID;
  let voiceChannelId = process.env.RADEC_OFFICE_VOICE_ID;
  let timesheetChannelId = process.env.TIMESHEET_TEXT_CHANNEL_ID;
  const usernameId = newState.member.user.id;

  if (newState.member.roles.cache.has(roleRequiredId)) {
    if (!oldState.channelId && newState.channelId == voiceChannelId) {
      // User joined the channel, save the current time
      userJoinTimes[username] = Date.now();
      client.channels.cache.get(timesheetChannelId).send(`User <@${usernameId}> has joined ${newState.channel.name} at ${new Date(userJoinTimes[username]).toLocaleString()}`);
    } 
    else if (oldState.channelId == voiceChannelId && !newState.channelId) {
      // User left the channel, calculate the time difference
      const elapsedTime = Date.now() - userJoinTimes[username];
      client.channels.cache.get(timesheetChannelId).send(`User <@${usernameId}> has left ${oldState.channel.name} at ${new Date().toLocaleString()}. They stayed for ${elapsedTime / 1000} seconds.`);
      delete userJoinTimes[username];
    }
  }
};
