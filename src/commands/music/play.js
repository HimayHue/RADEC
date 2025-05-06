const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {
   joinVoiceChannel,
   createAudioPlayer,
   createAudioResource,
   AudioPlayerStatus,
   NoSubscriberBehavior,
   StreamType
} = require('@discordjs/voice');
const youtubedl = require('youtube-dl-exec');
const path = require('node:path');
const { YOUTUBE_COOKIE } = require('../../../config.js');
const { connectToChannel } = require('../../connectionManager');



module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a YouTube link in your voice channel')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('link')
            .setDescription('Play a song by link.')
            .addStringOption(option =>
               option.setName('link')
                  .setDescription('YouTube Link')
                  .setRequired(true)
            );
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('song')
            .setDescription('Play a song by name.')
            .addStringOption(option =>
               option.setName('song')
                  .setDescription('Name of the song to search for')
                  .setRequired(true)
                  .setAutocomplete(true)
            );
      }),
   permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
         return await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
      }


      if (subcommand === 'song') {
         const songName = interaction.options.getString('song');
         const filePath = path.join(__dirname, '../../../content/music', `${songName}`);
         console.log(`Looking for song: ${songName} at ${filePath}`);

         // If the song exists in the local directory, play it directly
         const resource = createAudioResource(filePath);
         const player = createAudioPlayer({
            behaviors: {
               noSubscriber: NoSubscriberBehavior.Play,
            }
         });

         const connection = connectToChannel(voiceChannel);

         player.play(resource);
         connection.subscribe(player);

         return await interaction.reply(`🎵 Now playing: ${songName}`);
      }
      else if (subcommand === 'link') {
         const songLink = interaction.options.getString('link');

         // Validate the YouTube link format using a regex pattern
         const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
         if (!youtubeRegex.test(songLink)) {
            return await interaction.reply({ content: '❌ The provided link is not a valid YouTube link.', ephemeral: true });
         }

         await interaction.deferReply();

         try {

            const { spawn } = require('child_process');

            const process = spawn('yt-dlp', [
               '-f', 'bestaudio',
               '--no-playlist',
               '-o', '-', // output to stdout
               songLink
            ]);

            // Debugging output
            process.stderr.on('data', (data) => {
               console.error(`[yt-dlp stderr] ${data}`);
            });

            process.on('error', (err) => {
               console.error('yt-dlp process error:', err);
            });


            const resource = createAudioResource(process.stdout, {
               inputType: StreamType.Arbitrary
            });

            const player = createAudioPlayer({
               behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
               }
            });

            const connection = connectToChannel(voiceChannel);

            player.play(resource);
            connection.subscribe(player);

            await interaction.editReply(`🎵 Now playing: ${songLink}`);
         }
         catch (error) {
            console.error('Error searching/playing YouTube link:', error);
            await interaction.editReply('❌ Could not play the requested YouTube query.');
         }
      }

   }
};
