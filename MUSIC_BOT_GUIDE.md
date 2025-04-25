# Discord Music Bot Guide

This guide explains how to set up and use the music bot with slash commands.

## Prerequisites

Make sure you have the following installed:
- Node.js (v16.9.0 or higher)
- FFMPEG (for audio processing)

## Setup

1. Ensure your `.env` file has the necessary values:
   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy slash commands to your server:
   ```
   npm run deploy
   ```

4. Start the bot:
   ```
   npm start
   ```

## Available Commands

### `/play <input>`
Play a song from YouTube - now works with both direct URLs and search terms!
- Required parameter: `input` - Either a YouTube URL or search keywords

### `/search <query>`
Search for a song on YouTube and select from interactive results.
- Required parameter: `query` - Keywords to search for
- Features interactive buttons to select from multiple search results

### `/skip`
Skip the currently playing song.

### `/stop`
Stop playing music and clear the queue.

### `/queue`
View the current song queue.

## Troubleshooting

If you encounter issues with audio playback:

1. Ensure FFMPEG is installed correctly on your system.
   - Windows: Install using [this installer](https://www.gyan.dev/ffmpeg/builds/) and add to PATH
   - Linux: `sudo apt-get install ffmpeg`
   - macOS: `brew install ffmpeg`

2. Make sure your bot has the necessary permissions in Discord:
   - Connect
   - Speak
   - Use Voice Activity
   
3. Common errors and solutions:
   - **No audio output**: 
     - Make sure FFMPEG is installed correctly
     - Try restarting the bot
     - Check if your voice channel allows bot connections
   
   - **Playback errors with YouTube links**: 
     - Try using the `/search` command instead of direct links
     - Some YouTube videos may have restrictions that prevent bots from playing them
     - Use artist name and song title instead of URLs for better results

   - **"Cannot find module" errors**:
     - Run `npm install` to ensure all dependencies are installed
     - Particularly check: @discordjs/opus, play-dl, @discordjs/voice

## Important Dependencies

These are the key packages that power the music functionality:
- `@discordjs/voice`: Handles voice connections
- `play-dl`: Handles fetching and streaming from YouTube
- `@discordjs/opus`: Provides Opus encoding required for voice
- `ffmpeg-static`: Provides FFmpeg for processing audio

## Permissions

Your bot needs the following permissions:
- Read Messages/View Channels
- Send Messages
- Connect to Voice Channels
- Speak in Voice Channels
- Use Application Commands (for slash commands)

## Need Help?

If you need further assistance, please refer to the Discord.js documentation or contact the bot developer. 