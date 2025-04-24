import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows all available commands');

export async function execute(interaction) {
  const utilityEmbed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📋 Utility Commands')
    .setDescription('Commands for useful server tools')
    .addFields(
      { name: '/remindme', value: 'Set a reminder that DMs you after a certain time\n`/remindme time:10m message:"do homework"`' },
      { name: '/poll', value: 'Create a multiple-choice poll with reactions\n`/poll question:"Best day?" option1:"Monday" option2:"Friday"`' },
      { name: '/quote save', value: 'Save a memorable quote from the server\n`/quote save message:"Words to remember"`' },
      { name: '/quote random', value: 'Get a random quote from the server\n`/quote random`' },
      { name: '/quote list', value: 'List all quotes from the server\n`/quote list`' }
    );
  
  const funEmbed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🎮 Fun Commands')
    .setDescription('Commands for entertainment')
    .addFields(
      { name: '/vibecheck', value: 'Get your current vibe score\n`/vibecheck`' },
      { name: '/aestheticname', value: 'Convert text to aesthetic style unicode\n`/aestheticname input:"hello" style:Fullwidth`' },
      { name: '/emojiart', value: 'Convert text to emoji letter blocks\n`/emojiart input:"hi" style:Square`' }
    )
    .setFooter({ text: 'Use these slash commands in any channel' });
  
  await interaction.reply({ 
    embeds: [utilityEmbed, funEmbed],
    ephemeral: true
  });
} 