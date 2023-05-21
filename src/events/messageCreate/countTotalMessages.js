const { Client, Message } = require('discord.js');
const TotalMessages = require('../../models/TotalMessages'); 

/**
 *
 * @param {Client} client The client instance (bot) that will be used to manage the Discord interactions.
 * @param {Message} message The message instance that triggered the function.
 */

module.exports = async (client, message) => {
  if (message.author.bot) {
    console.log("bot sent message");
    return;
  };

  console.log("exectued count messages");
  const query = {
    userId: message.author.id,
  };

  try {
    // Attempt to find the existing totalMessages record for the user.
    const totalMessages = await TotalMessages.findOne(query);

    // If a totalMessages record is found:
    if (totalMessages) {
      // Add the totalMessages count and update username
      totalMessages.totalMessages += 1;
      totalMessages.username = message.member.displayName;
      // Save the updated totalMessages record, log any errors during the save operation.
      await totalMessages.save().catch((e) => {
        console.log(`Error saving updated total messages count ${e}`);
        return;
      });
    }
    // If no totalMessages record is found (i.e., it's the user's first time):
    else {
      // Create a new totalMessages record with the initial values.
      const newTotalMessages = new TotalMessages({
        userId: message.author.id,
        username: message.author.username,
        totalMessages: 1,
      });

      // Save the new totalMessages record.
      await newTotalMessages.save();

    }
  } catch (error) {
    // Log any unexpected errors during the process.
    console.log(`Error updating total messages: ${error}`);
  }
};