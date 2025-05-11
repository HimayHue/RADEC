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

      const trackLoop = async () => {
         const tracked = loadTracked();
         console.log(`[${new Date().toLocaleTimeString()}] tracking classes`);
         for (const entry of tracked) {
            try {
               const current = await scrapeSeats(entry.classNumber, entry.termCode);
               if (entry.lastAvailable !== null && current > entry.lastAvailable) {
                  const user = await client.users.fetch(entry.userId);
                  await user.send(`🚨 A seat has opened for class ${entry.classNumber} (${entry.termCode})! Now ${current} available.`);
               }
               entry.lastAvailable = current;
            } catch (err) {
               // handle errors if needed
            }
         }
         fs.writeFileSync('./trackedClasses.json', JSON.stringify(tracked, null, 2));
      };

      trackLoop();

      setInterval(trackLoop, 1 * 60 * 1000);

   },
};