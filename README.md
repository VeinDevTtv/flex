# Discord.js Slash Command Bot

A modern Discord bot using Discord.js v14+ with slash commands for utility and entertainment.

## Features

### Utility Commands
- **`/remindme`** - Set a reminder that DMs you after a specified time
- **`/poll`** - Create multiple-choice polls with automatic reactions
- **`/quote`** - Save and retrieve memorable quotes from your server

### Fun Commands
- **`/vibecheck`** - Get a randomized vibe score with a comment and GIF
- **`/aestheticname`** - Convert text to aesthetic unicode styles
- **`/emojiart`** - Convert text to emoji letter blocks

## Setup Instructions

### Prerequisites
- Node.js 16.9.0 or higher
- A Discord bot token (create one at [Discord Developer Portal](https://discord.com/developers/applications))
- Basic knowledge of Discord and command line

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/discord-bot.git
cd discord-bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following:
```
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_test_server_id_here  # For development purposes
```

4. Deploy the slash commands
```bash
npm run deploy
```

5. Start the bot
```bash
npm start
```

## Development

### Project Structure
```
discord-bot/
├── src/
│   ├── commands/
│   │   ├── fun/
│   │   └── utility/
│   ├── events/
│   ├── utils/
│   ├── deploy-commands.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

### Adding New Commands

1. Create a new command file in the appropriate directory (`src/commands/fun/` or `src/commands/utility/`)
2. Define the command using the SlashCommandBuilder
3. Export both the `data` and `execute` function
4. Run `npm run deploy` to register the new command

## Contributing

Feel free to fork this project and submit pull requests with new features or improvements!

## License

MIT License 