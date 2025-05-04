const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const guildName = "Himay Fan Club";

const addCommandsLocally = process.argv.includes('--local');
const addCommandsGlobally = process.argv.includes('--global');


const commands = [];

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
   // Grab all the command files from the commands directory you created earlier
   const commandsPath = path.join(foldersPath, folder);
   const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
   // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
   for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
         commands.push(command.data.toJSON());
      } else {
         console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
   }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands to the guild or globally based on the flags provided.
(async () => {
   try {
      // Deploy commands to personal server. 
      if (addCommandsLocally) {
         const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
         );
         console.log(`✅ Successfully added ${data.length} commands to the guild: ${guildName}.`);
      }

      // Deploy commands globally.
      if (addCommandsGlobally) {
         const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
         );
         console.log(`✅ Successfully added ${data.length} commands globally.`);
      }

      if (!addCommandsLocally && !addCommandsGlobally) console.log('⚠️ No flag provided. Use --local or --global to deploy commands.');

   }
   catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error('❌ Error deploying commands:', error);
   }
})();
