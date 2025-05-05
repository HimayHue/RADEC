const { Events, MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
   name: Events.InteractionCreate,
   async execute(interaction) {
      // Handle autocomplete separately
      if (interaction.isAutocomplete()) {
         const focusedValue = interaction.options.getFocused();

         // Dynamically load song list
         const musicDir = path.join(__dirname, '../../content/music');
         const choices = fs.readdirSync(musicDir)
            .filter(file => file.endsWith('.mp3') || file.endsWith('.ogg'))

         const trimmedChoics = choices
            .filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25);

         await interaction.respond(
            trimmedChoics.map(name => ({
               name: name.replace(/\.[^/.]+$/, ''), // remove extension
               value: name
            }))
         );
         return;
      }




      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
         console.error(`No command matching ${interaction.commandName} was found.`);
         return;
      }

      try {
         await command.execute(interaction);
      }
      catch (error) {
         console.error(error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
         }
         else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
         }
      }
   },
};