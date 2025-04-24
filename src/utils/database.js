import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths
const DB_DIR = path.join(__dirname, '../../data');
const REMINDERS_DB = path.join(DB_DIR, 'reminders.json');
const QUOTES_DB = path.join(DB_DIR, 'quotes.json');
const SETTINGS_DB = path.join(DB_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database files if they don't exist
const initDb = (file, defaultData) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
  }
};

initDb(REMINDERS_DB, { reminders: [] });
initDb(QUOTES_DB, { quotes: [] });
initDb(SETTINGS_DB, { 
  userSettings: {},
  guildSettings: {},
  defaultLanguage: 'en'
});

// Reminder functions
export const reminderDb = {
  getAll: () => {
    const data = JSON.parse(fs.readFileSync(REMINDERS_DB, 'utf8'));
    return data.reminders;
  },

  save: (reminder) => {
    const data = JSON.parse(fs.readFileSync(REMINDERS_DB, 'utf8'));
    data.reminders.push(reminder);
    fs.writeFileSync(REMINDERS_DB, JSON.stringify(data, null, 2));
    return reminder;
  },

  delete: (reminderId) => {
    const data = JSON.parse(fs.readFileSync(REMINDERS_DB, 'utf8'));
    data.reminders = data.reminders.filter(r => r.id !== reminderId);
    fs.writeFileSync(REMINDERS_DB, JSON.stringify(data, null, 2));
  },

  getByUserId: (userId) => {
    const data = JSON.parse(fs.readFileSync(REMINDERS_DB, 'utf8'));
    return data.reminders.filter(r => r.userId === userId);
  }
};

// Quote functions
export const quoteDb = {
  getAll: () => {
    const data = JSON.parse(fs.readFileSync(QUOTES_DB, 'utf8'));
    return data.quotes;
  },

  save: (quote) => {
    const data = JSON.parse(fs.readFileSync(QUOTES_DB, 'utf8'));
    data.quotes.push(quote);
    fs.writeFileSync(QUOTES_DB, JSON.stringify(data, null, 2));
    return quote;
  },

  delete: (quoteId) => {
    const data = JSON.parse(fs.readFileSync(QUOTES_DB, 'utf8'));
    data.quotes = data.quotes.filter(q => q.id !== quoteId);
    fs.writeFileSync(QUOTES_DB, JSON.stringify(data, null, 2));
  },

  getByGuildId: (guildId) => {
    const data = JSON.parse(fs.readFileSync(QUOTES_DB, 'utf8'));
    return data.quotes.filter(q => q.guildId === guildId);
  }
};

// Settings functions
export const settingsDb = {
  getUserSettings: (userId) => {
    const data = JSON.parse(fs.readFileSync(SETTINGS_DB, 'utf8'));
    return data.userSettings[userId] || { language: data.defaultLanguage };
  },

  setUserSettings: (userId, settings) => {
    const data = JSON.parse(fs.readFileSync(SETTINGS_DB, 'utf8'));
    data.userSettings[userId] = { ...data.userSettings[userId], ...settings };
    fs.writeFileSync(SETTINGS_DB, JSON.stringify(data, null, 2));
  },

  getGuildSettings: (guildId) => {
    const data = JSON.parse(fs.readFileSync(SETTINGS_DB, 'utf8'));
    return data.guildSettings[guildId] || { language: data.defaultLanguage };
  },

  setGuildSettings: (guildId, settings) => {
    const data = JSON.parse(fs.readFileSync(SETTINGS_DB, 'utf8'));
    data.guildSettings[guildId] = { ...data.guildSettings[guildId], ...settings };
    fs.writeFileSync(SETTINGS_DB, JSON.stringify(data, null, 2));
  }
};

// Schedule daily tasks
export const scheduleDailyTasks = (client) => {
  // Daily quote at 9 AM
  cron.schedule('0 9 * * *', async () => {
    const guilds = client.guilds.cache;
    for (const [guildId, guild] of guilds) {
      const settings = settingsDb.getGuildSettings(guildId);
      if (settings.dailyQuoteChannel) {
        const channel = await guild.channels.fetch(settings.dailyQuoteChannel);
        if (channel) {
          const quotes = quoteDb.getByGuildId(guildId);
          if (quotes.length > 0) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await channel.send({
              embeds: [{
                title: '📚 Daily Quote',
                description: `"${randomQuote.message}"`,
                footer: { text: `- ${randomQuote.author}` },
                color: 0x3498db
              }]
            });
          }
        }
      }
    }
  });
}; 