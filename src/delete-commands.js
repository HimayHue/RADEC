const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const guildName = "Himay Fan Club";

const cleanLocalCommands = process.argv.includes('--local');
const cleanGlobalCommands = process.argv.includes('--global');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
   try {

      // Clean local commands.
      if (cleanLocalCommands) {
         rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
            .then(() => console.log(`Successfully deleted all ${guildName} commands.`))
            .catch(console.error);
      }

      // Clean global commands.
      if (cleanGlobalCommands) {
         rest.put(Routes.applicationCommands(clientId), { body: [] })
            .then(() => console.log('Successfully deleted all global commands.'))
            .catch(console.error);
      }

      // If no flags are provided, inform the user.
      if (!cleanLocalCommands && !cleanGlobalCommands) console.log('⚠️ No flags provided. Use --clean for guild commands or --globalclean for global.');

   }
   catch (error) {
      console.error(error);
   }
})();