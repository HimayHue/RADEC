const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {
   joinVoiceChannel,
   createAudioPlayer,
   createAudioResource,
   AudioPlayerStatus,
   NoSubscriberBehavior,
   StreamType
} = require('@discordjs/voice');
const path = require('node:path');
const { YOUTUBE_COOKIE } = require('../../../config.js');



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

         const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
         });

         player.play(resource);
         connection.subscribe(player);

         return await interaction.reply(`🎵 Now playing: ${songName}`);
      }
      else if (subcommand === 'link') {


         const songLink = interaction.options.getString('link');
         console.log('[DEBUG] Extracted songLink:', songLink);

         const encodedUrl = encodeURI(songLink);



         await interaction.deferReply();
         try {
            // Get the stream.
            await play.setToken({
               youtube: {
                  cookie: YOUTUBE_COOKIE
               }
            });

            const stream = await play.stream(encodedUrl);

            // Create audio resource
            const resource = createAudioResource(stream.stream, {
               inputType: stream.type,
            });


            // Create player and connection
            const player = createAudioPlayer({
               behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
               }
            });

            const connection = joinVoiceChannel({
               channelId: voiceChannel.id,
               guildId: voiceChannel.guild.id,
               adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });

            // Play and subscribe
            player.play(resource);
            connection.subscribe(player);



            await interaction.editReply(`🎵 Now playing: ${songLink}`);
         }
         catch (error) {
            console.error('Error playing YouTube link:', error);
            await interaction.editReply('❌ Could not play that YouTube link.');
         }
      }
   }
};
