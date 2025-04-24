import { SlashCommandBuilder } from 'discord.js';
import { toAesthetic, toFancy } from '../../utils/textFormatter.js';

export const data = new SlashCommandBuilder()
  .setName('aestheticname')
  .setDescription('Turns normal text into aesthetic-style unicode')
  .addStringOption(option => 
    option.setName('input')
      .setDescription('Text to convert')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('style')
      .setDescription('Style of text')
      .setRequired(false)
      .addChoices(
        { name: 'Fullwidth (ｆｕｌｌｗｉｄｔｈ)', value: 'aesthetic' },
        { name: 'Fancy (ƒαηcу)', value: 'fancy' }
      ));

export async function execute(interaction) {
  const input = interaction.options.getString('input');
  const style = interaction.options.getString('style') || 'aesthetic';
  
  // Apply the selected style
  let result;
  if (style === 'aesthetic') {
    result = toAesthetic(input);
  } else if (style === 'fancy') {
    result = toFancy(input);
  }
  
  await interaction.reply({
    content: `✨ **${result}** ✨`,
    allowedMentions: { parse: [] } // Prevent mentions
  });
} 