import { SlashCommandBuilder } from 'discord.js';
import { toEmoji } from '../../utils/textFormatter.js';

export const data = new SlashCommandBuilder()
  .setName('emojiart')
  .setDescription('Converts text to emoji letter blocks')
  .addStringOption(option => 
    option.setName('input')
      .setDescription('Text to convert (A-Z characters work best)')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('style')
      .setDescription('Style of emoji letters')
      .setRequired(false)
      .addChoices(
        { name: 'Square', value: 'square' },
        { name: 'Circle', value: 'circle' }
      ));

export async function execute(interaction) {
  const input = interaction.options.getString('input');
  const style = interaction.options.getString('style') || 'square';
  
  if (input.length > 20) {
    await interaction.reply({ 
      content: '❌ Text is too long! Please keep it under 20 characters to avoid spamming.',
      ephemeral: true 
    });
    return;
  }
  
  // Convert to emoji text
  const emojiText = toEmoji(input, style);
  
  // If no emoji characters could be generated (e.g., all special characters)
  if (!emojiText.trim()) {
    await interaction.reply({ 
      content: '❌ Could not convert your text. Try using A-Z characters!',
      ephemeral: true 
    });
    return;
  }
  
  await interaction.reply({
    content: emojiText,
    allowedMentions: { parse: [] } // Prevent mentions
  });
} 