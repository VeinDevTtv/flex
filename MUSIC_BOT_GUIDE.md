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

### `/play <url>`
Play a song from YouTube.
- Required parameter: `url` - A valid YouTube URL to play

### `/skip`
Skip the currently playing song.

### `/stop`
Stop playing music and clear the queue.

### `/queue`
View the current song queue.

## Troubleshooting

If you encounter issues with audio playback:

1. Ensure FFMPEG is installed correctly on your system.
2. Make sure your bot has the necessary permissions in Discord:
   - Connect
   - Speak
   - Use Voice Activity
   
3. Common errors:
   - **Can't connect to voice channel**: Check your bot's permissions.
   - **No audio output**: Ensure FFMPEG is installed correctly.
   - **Playback errors**: Ensure you're using valid YouTube URLs.

## Permissions

Your bot needs the following permissions:
- Read Messages/View Channels
- Send Messages
- Connect to Voice Channels
- Speak in Voice Channels
- Use Application Commands (for slash commands)

## Need Help?

If you need further assistance, please refer to the Discord.js documentation or contact the bot developer. 