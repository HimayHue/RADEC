const { Events } = require('discord.js');
const fs = require('fs');

// Class Tracking 
const { loadTracked } = require('../utils/tracker');
const { scrapeSeats } = require('../utils/scraper');

module.exports = {
   name: Events.ClientReady,
   once: true,
   execute(client) {
      console.log(`Ready! Logged in as ${client.user.tag}`);

      setInterval(async () => {
         const tracked = loadTracked();
         console.log(`Tracking classes every minute`)
         for (const entry of tracked) {
            try {
               const current = await scrapeSeats(entry.classNumber, entry.termCode);
               if (entry.lastAvailable !== null && current > entry.lastAvailable) {
                  const user = await client.users.fetch(entry.userId);
                  await user.send(`🚨 A seat has opened for class ${entry.classNumber} (${entry.termCode})! Now ${current} available.`);
               }
               entry.lastAvailable = current;
            }
            catch (err) {
               console.error('Error checking class:', entry, err.message);
            }
         }
         fs.writeFileSync('./trackedClasses.json', JSON.stringify(tracked, null, 2));
      }, 1 * 60 * 1000); // every 1 minute

   },
};