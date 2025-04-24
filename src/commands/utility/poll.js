import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Number emojis for reactions (1-9)
const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a simple multiple-choice poll')
  .addStringOption(option => 
    option.setName('question')
      .setDescription('The poll question')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('option1')
      .setDescription('First option')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('option2')
      .setDescription('Second option')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('option3')
      .setDescription('Third option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option4')
      .setDescription('Fourth option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option5')
      .setDescription('Fifth option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option6')
      .setDescription('Sixth option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option7')
      .setDescription('Seventh option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option8')
      .setDescription('Eighth option')
      .setRequired(false))
  .addStringOption(option => 
    option.setName('option9')
      .setDescription('Ninth option')
      .setRequired(false));

export async function execute(interaction) {
  const question = interaction.options.getString('question');
  
  // Collect all provided options
  const options = [];
  for (let i = 1; i <= 9; i++) {
    const option = interaction.options.getString(`option${i}`);
    if (option) options.push(option);
  }
  
  // Create poll embed
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📊 ' + question)
    .setFooter({ text: `Poll by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setTimestamp();
  
  // Add options to description
  let description = '';
  options.forEach((option, index) => {
    description += `${numberEmojis[index]} ${option}\n\n`;
  });
  
  embed.setDescription(description);
  
  // Send the poll
  const pollMessage = await interaction.reply({ 
    embeds: [embed],
    fetchReply: true
  });
  
  // Add reactions for each option
  for (let i = 0; i < options.length; i++) {
    await pollMessage.react(numberEmojis[i]);
  }
} 