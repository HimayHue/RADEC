const { SlashCommandBuilder } = require('discord.js');
const {
   joinVoiceChannel,
   createAudioPlayer,
   createAudioResource,
   AudioPlayerStatus,
   NoSubscriberBehavior,
   StreamType
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');


module.exports = {
   data: new SlashCommandBuilder()
      .setName('playdefault')
      .setDescription('Girls Wanna Have Fun Remix'),

   async execute(interaction) {
      const audioPath = path.join(__dirname, '../../../content/music/2.mp3');
      // Check if the audio file exists
      if (!fs.existsSync(audioPath)) {
         console.error(`Audio file not found: ${audioPath}`);
         return await interaction.reply({ content: '❌ Audio file not found.', ephemeral: true });
      }
      // Error Handles
      console.log(`User ${interaction.user.tag} requested to play the default song.`);
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) return await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });

      const connection = joinVoiceChannel({
         channelId: voiceChannel.id,
         guildId: voiceChannel.guild.id,
         adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer({
         behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
         }
      });


      const resource = createAudioResource(audioPath);;
      player.play(resource);
      connection.subscribe(player);

      await interaction.reply(`🎵 Now playing default track: Girls Wanna Have Fun Remix`);
   }
};
