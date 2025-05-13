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
         const trackedCourses = loadTracked(); // Load tracked classes
         for (const course of trackedCourses) {
            try {
               const seatsAvailable = await scrapeSeats(course.classNumber, course.termCode);
               console.log(`[${new Date().toLocaleTimeString()}] Currents seats for ${course.classNumber} (${course.termCode}) are ${seatsAvailable} `);

               function seatJustOpened(prev, current) {
                  return prev !== null && prev === 0 && current > 0;
               }

               if (seatJustOpened(course.previousAvailableSeats, seatsAvailable)) {
                  const user = await client.users.fetch(course.userId);
                  await user.send(`🚨 A seat has opened for class ${course.classNumber} (${course.termCode})! Now ${seatsAvailable} available.`);
               }
               // Only update the previousAvailableSeats if it has changed to prevent unnecessary writes
               if (course.previousAvailableSeats != seatsAvailable) course.previousAvailableSeats = seatsAvailable;
            }
            catch (err) {
               // handle errors if needed
            }
         }
         fs.writeFileSync('./trackedClasses.json', JSON.stringify(trackedCourses, null, 2));

         // Schedule next run with random interval
         const nextInterval = (50 + Math.random() * 20) * 1000;
         setTimeout(trackLoop, nextInterval);
      };

      trackLoop();
   },
};