
RADEC Discord Bot
=================

RADEC is a personal Discord bot that plays locally stored audio files and YouTube links via voice channels. Designed to run on a Raspberry Pi 4 and used in a single server.

Features
--------

- `/play song` — plays a song from your local folder (`content/music`)
- `/play link` — streams YouTube audio using `yt-dlp` (no downloading)
- Command deployment support with `--local` and `--global` flags

Requirements
------------

Make sure the following are installed and accessible from the command line:

1. **Node.js** (v18 or newer recommended)
2. **FFmpeg**  
   - Install:  
     sudo apt install ffmpeg
3. **yt-dlp** (YouTube audio extraction tool)  
   - Install globally:  
     sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
     sudo chmod a+rx /usr/local/bin/yt-dlp
   - Test:  
     yt-dlp --version

Project Structure
-----------------

RADEC/
├── content/
│   └── music/             # Local songs go here
├── src/
│   ├── commands/
│   │   └── music/         # Contains /play command logic
│   └── events/            # interactionCreate.js, ready.js, etc.
├── .env                   # Token and IDs (not tracked)
├── config.js              # YOUTUBE_COOKIE and other settings
└── deploy-commands.js     # Use --local or --global

Configuration
-------------

### `.env`

Create a `.env` file with:

    TOKEN=your_discord_bot_token
    CLIENT_ID=your_bot_client_id
    GUILD_ID=your_test_guild_id

### `config.js`

    module.exports = {
       YOUTUBE_COOKIE: "YOUR_COOKIE_HERE"
    };

Use your browser’s YouTube cookies to extract videos if you run into age/gated content issues.

Deploy Commands
---------------

From the root:

- To your test guild:
      node deploy-commands.js --local
- Globally:
      node deploy-commands.js --global

Notes
-----

- Your Raspberry Pi must be running with audio output configured correctly.
- The bot does **not** download songs from YouTube—`yt-dlp` pipes audio into Discord.
- You may expand this with autocomplete, a database, or queues in the future.
