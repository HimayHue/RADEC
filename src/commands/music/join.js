const {
    Client,
    VoiceState,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } = require('discord.js');
  
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     * @param {VoiceState} userVoiceState
     */
  
    callback: async (client, interaction, userVoiceState) => {
      const voiceChannel =
        interaction.options.get('channel')?.channelId || userVoiceState.channelId;
  
      await interaction.deferReply();
  
      if (!voiceChannel) { // X
        await interaction.editReply("Join or selected a valid voice channel.");
        return;
      }
  
  
      // Join the voice channel
      try {
        await voiceChannel.join();
      } catch (error) {
        console.log(`There was an error when joining: ${error}`);
      }
    },
  
    name: 'join',
    description: 'RADEC joins a voice channel.',
    options: [
      {
        name: 'channel',
        description: 'The channel you want RADEC to join.',
        type: ApplicationCommandOptionType.voiceChannel,
        required: false,
      },
    ],
  };
  