const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const token = process.env.TOKEN;


// Create a new client instance
const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
   ]
});


// Load command files from the commands directory
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
   const commandsPath = path.join(foldersPath, folder);
   const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
   for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
         client.commands.set(command.data.name, command);
         console.log(`Loaded command: ${command.data.name} from ${path.relative(__dirname, filePath)}`);
      }
      else {
         console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
   }
}


// Load event files from the events directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
   const filePath = path.join(eventsPath, file);
   const event = require(filePath);
   if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
      console.log(`Loaded event: ${event.name} (once) from ${path.relative(__dirname, filePath)}`);
   }
   else {
      client.on(event.name, (...args) => event.execute(...args));
      console.log(`Loaded event: ${event.name} from ${path.relative(__dirname, filePath)}`);
   }
}


// Log in to Discord with your client's token
client.login(token);