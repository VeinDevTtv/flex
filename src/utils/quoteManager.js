import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the quotes JSON file
const quotesFilePath = path.join(__dirname, '../../data/quotes.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize quotes file if it doesn't exist
if (!fs.existsSync(quotesFilePath)) {
  fs.writeFileSync(quotesFilePath, JSON.stringify({ quotes: [] }));
}

// Get all quotes
export function getQuotes() {
  const data = fs.readFileSync(quotesFilePath, 'utf8');
  return JSON.parse(data).quotes;
}

// Save a new quote
export function saveQuote({ message, author, authorId, timestamp, guildId }) {
  const data = fs.readFileSync(quotesFilePath, 'utf8');
  const json = JSON.parse(data);
  
  const newQuote = {
    id: json.quotes.length + 1,
    message,
    author,
    authorId,
    timestamp,
    guildId
  };
  
  json.quotes.push(newQuote);
  fs.writeFileSync(quotesFilePath, JSON.stringify(json, null, 2));
  
  return newQuote;
}

// Get a random quote for a guild
export function getRandomQuote(guildId) {
  const quotes = getQuotes().filter(quote => quote.guildId === guildId);
  
  if (quotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

// Get all quotes for a guild
export function getGuildQuotes(guildId) {
  return getQuotes().filter(quote => quote.guildId === guildId);
} 