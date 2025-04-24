import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Share a YouTube link for Discord to auto-play')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Valid YouTube video URL')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply();
  
  const url = interaction.options.getString('url');
  
  // Simple validation for YouTube URL
  if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i)) {
    return interaction.editReply('❌ Please provide a valid YouTube URL.');
  }
  
  try {
    // Create a nice embed
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🎵 Music Time!')
      .setDescription(`Click the link to listen: ${url}`)
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    
    // Post the link directly so Discord's preview works
    await interaction.editReply({ 
      content: `${url}\nHere's a YouTube video shared by ${interaction.user}. Discord should auto-embed it for you to play!`,
      embeds: [embed]
    });
    
  } catch (error) {
    console.error('Error in link command:', error);
    return interaction.editReply(`❌ An error occurred: ${error.message}`);
  }
} 