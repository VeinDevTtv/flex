import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { settingsDb } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('confess')
  .setDescription('Send an anonymous confession to the confession channel')
  .addStringOption(option => 
    option.setName('confession')
      .setDescription('Your anonymous confession')
      .setRequired(true));

export async function execute(interaction) {
  const confession = interaction.options.getString('confession');
  const settings = settingsDb.getGuildSettings(interaction.guildId);
  
  if (!settings.confessionChannel) {
    await interaction.reply({ 
      content: '❌ No confession channel has been set up for this server. Ask an admin to set one up!',
      ephemeral: true 
    });
    return;
  }
  
  try {
    const channel = await interaction.guild.channels.fetch(settings.confessionChannel);
    
    if (!channel) {
      await interaction.reply({ 
        content: '❌ The confession channel no longer exists. Please contact an admin.',
        ephemeral: true 
      });
      return;
    }
    
    // Create confession embed
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('💭 Anonymous Confession')
      .setDescription(confession)
      .setFooter({ text: 'Use /confess to share your own confession' })
      .setTimestamp();
    
    // Send confession
    await channel.send({ embeds: [embed] });
    
    // Confirm to user
    await interaction.reply({ 
      content: '✅ Your confession has been sent anonymously!',
      ephemeral: true 
    });
  } catch (error) {
    console.error('Error sending confession:', error);
    await interaction.reply({ 
      content: '❌ There was an error sending your confession. Please try again later.',
      ephemeral: true 
    });
  }
} 