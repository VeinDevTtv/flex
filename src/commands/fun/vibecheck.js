import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Vibe responses based on score ranges
const vibeResponses = [
  { min: 0, max: 20, message: 'You need a vibe reset ASAP 😬', color: 0xe74c3c },
  { min: 21, max: 40, message: 'Not great, maybe take a nap 😴', color: 0xe67e22 },
  { min: 41, max: 60, message: 'Mid vibes, could be worse 🤷', color: 0xf1c40f },
  { min: 61, max: 80, message: 'Good energy today! ✨', color: 0x2ecc71 },
  { min: 81, max: 100, message: 'You\'re floating rn 🌊', color: 0x3498db }
];

// GIFs for each vibe level
const vibeGifs = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHJjNHVkN3g3MGl5cG16ODRwdGswbThqZmI1MjhpZTNqYmM3cGx5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j0qSbeNFuzjhXKFVSP/giphy.gif', 
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDRidTQxYmprODV4cTVtY2kzc3VxOTJ3MWF0dzQzeDk3NGlsMjVoaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26DNdV3b6dqn1jzR6/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjYyemU2dGJ2bmxiN3h0c3ZnMGhyOTlmYnZ5MXZnMXRraGJ3NHh2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j2fNMhKEgfJiE3eMC7/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemVodmt5dTRmZnp0cWxrbTQ5Zng2Zm91emZxbjZoZGZ0dGg3MmluZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l46CvHFPQ9aFkZ5sY/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2ZqeTV0ZHVia3EwbWE2NTZhN3NrcGNuOG9xd2U3ZTVtZXg3OWpqbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5Y2bU7FqLOEAj41Pbu/giphy.gif'
];

export const data = new SlashCommandBuilder()
  .setName('vibecheck')
  .setDescription('Check your current vibe level');

export async function execute(interaction) {
  // Generate a random vibe score from 0-100
  const vibeScore = Math.floor(Math.random() * 101);
  
  // Determine which response range the score falls into
  const responseIndex = vibeResponses.findIndex(
    range => vibeScore >= range.min && vibeScore <= range.max
  );
  
  const response = vibeResponses[responseIndex];
  const gifUrl = vibeGifs[responseIndex];
  
  // Create embed
  const embed = new EmbedBuilder()
    .setColor(response.color)
    .setTitle(`🎯 Vibe Check: ${vibeScore}%`)
    .setDescription(response.message)
    .setImage(gifUrl)
    .setFooter({ text: `${interaction.user.tag}'s vibe check` })
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
} 