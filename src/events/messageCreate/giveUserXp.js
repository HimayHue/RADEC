// Import necessary modules from discord.js library and local utility files
const { Client, Message } = require('discord.js');
const Level = require('../../models/Level'); 
const calculateLevelXp = require('../../utils/calculateLevelXp');


// Create a set to manage cooldowns for users to prevent spamming and misuse
const cooldowns = new Set();

// A function to generate random XP within the given range
function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * A function that handles leveling up of a user based on the received message.
 *
 * @param {Client} client The client instance (bot) that will be used to manage the Discord interactions.
 * @param {Message} message The message instance that triggered the function.
 */
module.exports = async (client, message) => {
  // Check if the message was sent in a guild, not by a bot, and the author is not in cooldown.
  if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

  console.log("ran give user exp");
  // Calculate a random XP to give to the user.
  const xpToGive = getRandomXp(45, 60 );

  // Define a query to find the user's level in the guild.
  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    // Attempt to find the existing level record for the user.
    const level = await Level.findOne(query);

    // If a level record is found:
    if (level) {
      // Add the calculated XP to the user's current XP.
      level.xp += xpToGive;
      

      // Check if the user's XP exceeds the required XP for the next level.
      if (level.xp > calculateLevelXp(level.level)) {
        // Reset XP and increase the user's level.
        level.xp = 0;
        level.level += 1;

        // Announce the level-up in the channel where the message was sent.
        message.channel.send(`${message.member} you have leveled up to **level ${level.level}**.`);
      }

      // Save the updated level record, log any errors during the save operation.
      await level.save().catch((e) => {
        console.log(`Error saving updated level ${e}`);
        return;
      });

      // Add the user to the cooldowns set and remove them after 1 minute.
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
    // If no level record is found (i.e., it's the user's first time):
    else {
      // Create a new level record with the initial XP.
      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
      });

      // Save the new level record.
      await newLevel.save();

      // Add the user to the cooldowns set and remove them after 1 minute.
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    // Log any unexpected errors during the process.
    console.log(`Error giving xp: ${error}`);
  }
};
