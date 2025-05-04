const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('node:path');
const play = require('play-dl');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play music from YouTube')
      .addStringOption(option =>
         option.setName('url')
            .setDescription('YouTube video URL')
            .setRequired(false)),

   async execute(interaction) {
      const url = interaction.options.getString('url');
      const defaultSong = path.join(__dirname, '../../content/music/Lil Uzi Vert - Myron [Official Audio].mp3');

      // User must be in a voice channel
      const voiceChannel = interaction.member.voice.channel;
      console.log(`User ${interaction.user.tag} requested to play URL: ${url}`);
      if (!voiceChannel) return await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });

      await interaction.deferReply();
      if (!url) {
         try {
            // Play a default song 
            const resource = createAudioResource(defaultSong);

            const player = createAudioPlayer();

            const connection = joinVoiceChannel({
               channelId: voiceChannel.id,
               guildId: voiceChannel.guild.id,
               adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Subscribe the connection to the audio player (will play audio on the voice connection)
            player.play(resource);
            connection.subscribe(player);


         }
         catch (error) {
            console.error('Playback error:', error);
            return await interaction.editReply('❌ An error occurred while trying to play music.');
         }
      }

      // Look up the URL to ensure it's a valid YouTube link
      else {
         try {
            const stream = await play.stream(url, { discordPlayerCompatibility: true });
            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            const player = createAudioPlayer();

            const connection = joinVoiceChannel({
               channelId: voiceChannel.id,
               guildId: interaction.guild.id,
               adapterCreator: interaction.guild.voiceAdapterCreator
            });

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
               connection.destroy();
            });

            await interaction.editReply(`▶️ Now playing: ${url}`);
         }
         catch (error) {
            console.error('Playback error:', error);
            await interaction.editReply('❌ Could not play that YouTube link.');
         }
      }
   }
};
