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

## Troubleshooting Audio Playback

If you're not hearing any audio, try these steps:

### For Windows Users:

1. **Install FFmpeg properly**:
   - Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
   - Download the "ffmpeg-release-essentials.zip" file
   - Extract the ZIP file
   - Add the bin folder to your system PATH

2. **Install required voice dependencies**:
   ```
   npm install @discordjs/opus@0.9.0 libsodium-wrappers@0.7.13 opusscript@0.0.8 ffmpeg-static play-dl@1.9.7 --save
   ```

3. **Install Visual C++ Build Tools**:
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install the "Desktop development with C++" workload

4. **Set Visual Studio Version**:
   ```
   npm config set msvs_version 2019
   ```

5. **Verify Discord permissions**:
   - Make sure your bot has "Connect" and "Speak" permissions in the voice channel
   - Check that you haven't muted the bot in Discord

### For All Users:

1. **Check your audio device**:
   - Make sure your output device is set correctly in Discord
   - Try adjusting the volume in Discord settings

2. **Restart the bot**:
   - Stop the bot (Ctrl+C in the terminal)
   - Run `npm start` again

3. **Reinstall voice dependencies**:
   ```
   npm install @discordjs/voice@0.16.0 @discordjs/opus libsodium-wrappers --save
   ```

4. **Use different music sources**:
   - Try different YouTube links
   - Use search terms instead of direct URLs
   - Use more popular songs that are less likely to have restrictions

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