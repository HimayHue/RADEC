const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Scrapes ASU's class search page to retrieve seat availability for a given class number and term.
 * Utilizes Puppeteer to load and parse JavaScript-rendered content.
 *
 * @param {number} classNumber - The 5-digit ASU class number (e.g., 48322).
 * @param {string} termCode - The ASU term code (e.g., '2254' for Summer 2025).
 * @returns {Promise<{ available: number, capacity: number } | null>} - Resolves with seat data or null if not found.
 */
async function scrapeSeats(classNumber, termCode) {
   const CLASS_SEARCH_URL = `https://catalog.apps.asu.edu/catalog/classes/classlist?campusOrOnlineSelection=C&honors=F&keywords=${classNumber}&promod=F&searchType=all&term=${termCode}`;

   const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
   });

   const page = await browser.newPage();

   // Navigate to the class list page and wait for network activity to idle
   await page.goto(CLASS_SEARCH_URL, { waitUntil: 'networkidle2' });

   // Wait until the seat text (e.g., "28 of 65") is rendered on the page
   await page.waitForFunction(() => {
      const seatElement = document.querySelector('.class-results-cell.seats .text-nowrap');
      return seatElement && /\d+\s+of\s+\d+/.test(seatElement.innerText);
   }, { timeout: 15000 });

   // Extract the seat availability text from the DOM (e.g., "28 of 65")
   const seatText = await page.evaluate(() => {
      const seatElement = document.querySelector('.class-results-cell.seats .text-nowrap');
      return seatElement?.innerText.trim() || null;
   });


   // Use regex to parse the seat availability into available and total values
   const seatMatch = seatText.match(/^(\d+)\s+of\s+(\d+)/);
   if (!seatMatch) {
      console.error("Could not parse seat counts");
      await browser.close();
      return null;
   }

   const availableSeats = parseInt(seatMatch[1], 10);
   const totalSeats = parseInt(seatMatch[2], 10);

   console.log(`Available seats: ${availableSeats}`);
   console.log(`Total capacity: ${totalSeats}`);

   await browser.close();

   return { available: availableSeats, capacity: totalSeats };
}

module.exports = { scrapeSeats };
