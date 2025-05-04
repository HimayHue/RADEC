const { SlashCommandBuilder } = require('discord.js');
const {
   joinVoiceChannel,
   createAudioPlayer,
   createAudioResource,
   AudioPlayerStatus,
   NoSubscriberBehavior
} = require('@discordjs/voice');
const path = require('node:path');
const fs = require('fs');


module.exports = {
   data: new SlashCommandBuilder()
      .setName('playdefault')
      .setDescription('Play a local MP3 file'),

   async execute(interaction) {
      console.log(`User ${interaction.user.tag} requested to play the default song.`);
      const defaultSong = path.join(__dirname, '../../../content/music/Myron.mp3');

      if (!fs.existsSync(defaultSong)) {
         console.error('❌ MP3 file not found at:', defaultSong);
         await interaction.reply('❌ Default song file not found. Please check the file path.');
         return;
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
         return await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
      }

      const connection = joinVoiceChannel({
         channelId: voiceChannel.id,
         guildId: voiceChannel.guild.id,
         adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const resource = createAudioResource(defaultSong);
      const player = createAudioPlayer({
         behaviors: {
            noSubscriber: NoSubscriberBehavior.Play // <- forces playback even if Discord thinks no one is listening
         }
      });
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
         console.log('✅ Audio is playing');
      });

      player.on(AudioPlayerStatus.Idle, () => {
         console.log('🔇 Audio finished (Idle)');
      });

      player.on('error', error => {
         console.error('❌ Audio player error:', error);
      });

      connection.on('stateChange', (oldState, newState) => {
         console.log(`🔄 Voice connection state changed: ${oldState.status} -> ${newState.status}`);
      });

      player.on('stateChange', (oldState, newState) => {
         console.log(`🎵 Audio player state changed: ${oldState.status} -> ${newState.status}`);
      });

      console.log('👥 Voice channel members:', voiceChannel.members.map(m => `${m.user.username}${m.user.bot ? ' (bot)' : ''}`).join(', '));


      await interaction.reply('🎵 Now playing default track: **Myron**');
   }
};
