# Discord.js Slash Command Bot

A modern, interactive Discord bot using Discord.js v14+ with slash commands that combine utility and entertainment features. This bot supports Discord's Application Command system (qualifying for the Active Developer Badge) and is designed to be modular and scalable for easy expansion.

## ⚙️ Features

### Utility Commands

#### `/remindme` - Personal Reminder System
- Set timed reminders that DM you after a specified interval
- Supports multiple time units: seconds (s), minutes (m), hours (h), days (d)
- Example: `/remindme time:10m message:"finish homework"`
- Replies with the exact time the reminder will trigger

#### `/poll` - Interactive Voting
- Create multiple-choice polls with automatic emoji reactions
- Support for up to 9 options
- Auto-reacts with number emojis (1️⃣, 2️⃣, etc.)
- Shows who created the poll and when
- Example: `/poll question:"Best pizza topping?" option1:"Pepperoni" option2:"Mushrooms" option3:"Pineapple"`

#### `/quote` - Server Quote Manager
Three subcommands for managing memorable quotes:
- `/quote save` - Save a new quote with author attribution and timestamp
- `/quote random` - Display a random quote from the server's collection
- `/quote list` - Show all quotes saved in the server
- Quotes are persistently stored between bot restarts

#### `/help` - Command Directory
- Displays all available commands with descriptions and examples
- Organized by category (utility and fun)
- Shows as an ephemeral message visible only to the command user

### Fun Commands

#### `/vibecheck` - Randomized Mood Rating
- Generates a random "vibe score" from 0-100%
- Provides a custom message based on your score range
- Includes a thematic GIF that matches your current vibe level
- Different color themes for each vibe range

#### `/aestheticname` - Text Styling
- Transforms regular text into aesthetic unicode styles
- Two style options:
  - Fullwidth (ｆｕｌｌｗｉｄｔｈ) - Classic vaporwave style
  - Fancy (ƒαηcу) - Stylized unicode characters
- Example: `/aestheticname input:"hello world" style:Fullwidth`

#### `/emojiart` - Emoji Letter Blocks
- Converts text into emoji letter blocks (A-Z)
- Two style options:
  - Square emoji style (🅰 🅱 🅲...)
  - Circle emoji style (🅐 🅑 🅒...)
- Length limit to prevent spam
- Example: `/emojiart input:"DISCORD" style:Square`

## 🚀 Setup Instructions

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

## 🔧 Development

### Project Structure
```
discord-bot/
├── src/
│   ├── commands/
│   │   ├── fun/          # Entertainment commands
│   │   └── utility/      # Utility tools 
│   ├── events/           # Discord.js event handlers
│   ├── utils/            # Helper functions and utilities
│   ├── deploy-commands.js # Command registration script
│   └── index.js          # Main bot file
├── data/                 # Persistent data storage (quotes)
├── .env                  # Environment variables (not in repo)
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

### Technical Details
- Built with Discord.js v14+ using Application Commands
- Uses ES Modules for better code organization
- In-memory reminder system with time formatting
- Persistent JSON-based storage for quotes
- Unicode text transformation utilities
- Modular command structure for easy expansion

### Adding New Commands

1. Create a new command file in the appropriate directory (`src/commands/fun/` or `src/commands/utility/`)
2. Define the command using the SlashCommandBuilder
3. Export both the `data` and `execute` function
4. Run `npm run deploy` to register the new command

## 🤝 Contributing

Feel free to fork this project and submit pull requests with new features or improvements! Some ideas for expansion:
- Add music playback features
- Create moderation commands
- Implement a leveling system
- Add game integrations

## 📝 License

MIT License 