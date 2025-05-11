const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSeats(classNumber, termCode) {
   console.log(`Scraping seats for class: ${classNumber}, term: ${termCode}`);
   const url = `https://catalog.apps.asu.edu/catalog/classes/classlist?campusOrOnlineSelection=C&catalogNbr=${classNumber}&honors=F&promod=F&searchType=all&subject=CSE&term=${termCode}`;
   const { data } = await axios.get(url);
   const $ = cheerio.load(data);

   const section = $('.section-info').filter((_, el) => $(el).find('.class-number').text().includes(classNumber)).first();
   const text = section.find('.available-seats').text().trim();
   const available = parseInt(text, 10);
   console.log(`Seats available for ${classNumber} ${termCode}: ${available}`);

   if (isNaN(available)) throw new Error('Seat count not found or invalid');
   return available;
}

module.exports = { scrapeSeats };
