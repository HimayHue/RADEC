/* 
Created By: Himay
Creation Date: 10/15/2023
Last Edit Date: 10/15/2023
Last Edit Notes:

Important Notes:
*/

const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Timesheet Commands',
    options: [
        {
            name: 'user',
            description: 'Name of the user to clear messages for',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'amount',
            description: 'Amount of messages to clear',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();
    
        let user = interaction.options.getString('user');
        let amount = interaction.options.getInteger('amount');
        const isAdmin = interaction.member.roles.cache.some(role => role.name === 'Radec');
        
        if (!user) user = interaction.user.id;
        if (!amount) amount = 10;
        if (amount > 25 && !isAdmin) {
            return interaction.editReply(`You cannot clear more than 25 messages at once.`);
        }

        if (!isAdmin) {
            // Can only clear messages for yourself
            return interaction.editReply(`You do not have permission to use this command.`);
        }


        let messages = await interaction.channel.messages.fetch({ limit: amount });
        messages = messages.filter(message => message.author.id === user);
        authodIds = messages.map(message => message.author.id);
    
        console.log(authodIds);
    
        // interaction.channel.bulkDelete(messages);
    
        return interaction.editReply(`You have cleared ${messages.size} messages for ${user}.`);
    }
};    
