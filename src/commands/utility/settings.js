import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { settingsDb } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Configure server settings')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(subcommand =>
    subcommand
      .setName('confession')
      .setDescription('Set up the confession channel')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('Channel for anonymous confessions')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('dailyquote')
      .setDescription('Set up daily quote channel')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('Channel for daily quotes')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('language')
      .setDescription('Set server language')
      .addStringOption(option =>
        option.setName('language')
          .setDescription('Server language')
          .setRequired(true)
          .addChoices(
            { name: 'English', value: 'en' },
            { name: 'Français', value: 'fr' },
            { name: 'العربية', value: 'ar' },
            { name: 'Nederlands', value: 'nl' }
          )))
  .addSubcommand(subcommand =>
    subcommand
      .setName('view')
      .setDescription('View current server settings'));

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const settings = settingsDb.getGuildSettings(interaction.guildId);
  
  if (subcommand === 'confession') {
    const channel = interaction.options.getChannel('channel');
    settingsDb.setGuildSettings(interaction.guildId, {
      ...settings,
      confessionChannel: channel.id
    });
    
    await interaction.reply({
      content: `✅ Confession channel set to ${channel}`,
      ephemeral: true
    });
  }
  else if (subcommand === 'dailyquote') {
    const channel = interaction.options.getChannel('channel');
    settingsDb.setGuildSettings(interaction.guildId, {
      ...settings,
      dailyQuoteChannel: channel.id
    });
    
    await interaction.reply({
      content: `✅ Daily quote channel set to ${channel}`,
      ephemeral: true
    });
  }
  else if (subcommand === 'language') {
    const language = interaction.options.getString('language');
    settingsDb.setGuildSettings(interaction.guildId, {
      ...settings,
      language
    });
    
    await interaction.reply({
      content: `✅ Server language set to ${language}`,
      ephemeral: true
    });
  }
  else if (subcommand === 'view') {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Server Settings')
      .addFields(
        { 
          name: 'Confession Channel',
          value: settings.confessionChannel ? 
            `<#${settings.confessionChannel}>` : 
            'Not set'
        },
        {
          name: 'Daily Quote Channel',
          value: settings.dailyQuoteChannel ? 
            `<#${settings.dailyQuoteChannel}>` : 
            'Not set'
        },
        {
          name: 'Language',
          value: settings.language || 'English (default)'
        }
      )
      .setFooter({ text: 'Use /settings to configure these settings' })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
} 