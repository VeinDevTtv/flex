import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Calculate the compatibility between two users')
  .addUserOption(option => 
    option.setName('user1')
      .setDescription('First user')
      .setRequired(true))
  .addUserOption(option => 
    option.setName('user2')
      .setDescription('Second user')
      .setRequired(true));

// Ship name generator
function generateShipName(name1, name2) {
  const firstHalf = name1.slice(0, Math.ceil(name1.length / 2));
  const secondHalf = name2.slice(Math.floor(name2.length / 2));
  return firstHalf + secondHalf;
}

// Compatibility messages based on percentage
const compatibilityMessages = [
  { min: 0, max: 20, message: "💔 It's not meant to be...", color: 0xe74c3c },
  { min: 21, max: 40, message: "😕 Maybe just friends?", color: 0xe67e22 },
  { min: 41, max: 60, message: "🤔 There's potential here!", color: 0xf1c40f },
  { min: 61, max: 80, message: "💕 A match made in heaven!", color: 0x2ecc71 },
  { min: 81, max: 100, message: "💘 Soulmates! 💘", color: 0x9b59b6 }
];

export async function execute(interaction) {
  const user1 = interaction.options.getUser('user1');
  const user2 = interaction.options.getUser('user2');
  
  // Generate a "random" but consistent percentage based on user IDs
  const combinedId = (BigInt(user1.id) + BigInt(user2.id)).toString();
  const percentage = parseInt(combinedId.slice(-2)) % 101;
  
  // Get compatibility message
  const compatibility = compatibilityMessages.find(
    range => percentage >= range.min && percentage <= range.max
  );
  
  // Generate ship name
  const shipName = generateShipName(user1.username, user2.username);
  
  // Create embed
  const embed = new EmbedBuilder()
    .setColor(compatibility.color)
    .setTitle('💘 Ship Compatibility')
    .setDescription(`${user1.username} + ${user2.username} = ${shipName}`)
    .addFields(
      { name: 'Compatibility', value: `${percentage}%` },
      { name: 'Verdict', value: compatibility.message }
    )
    .setThumbnail(user1.displayAvatarURL())
    .setImage(user2.displayAvatarURL())
    .setFooter({ text: 'Powered by the magic of love ✨' })
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
} 