import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { settingsDb } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('challenge')
  .setDescription('Create and manage server challenges')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create a new challenge')
      .addStringOption(option =>
        option.setName('title')
          .setDescription('Title of the challenge')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('description')
          .setDescription('Description of the challenge')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reward')
          .setDescription('Reward for completing the challenge')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('duration')
          .setDescription('Duration in hours (0 for no limit)')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List active challenges'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('complete')
      .setDescription('Mark a challenge as complete')
      .addStringOption(option =>
        option.setName('challenge')
          .setDescription('Title of the challenge')
          .setRequired(true)));

// Store challenges in memory (you might want to move this to the database)
const challenges = new Map();

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'create') {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const reward = interaction.options.getString('reward');
    const duration = interaction.options.getInteger('duration');
    
    if (challenges.has(title)) {
      await interaction.reply({
        content: '❌ A challenge with this title already exists!',
        ephemeral: true
      });
      return;
    }
    
    challenges.set(title, {
      title,
      description,
      reward,
      creator: interaction.user.id,
      createdAt: Date.now(),
      expiresAt: duration > 0 ? Date.now() + (duration * 3600000) : null,
      participants: new Set(),
      completed: new Set()
    });
    
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🎯 New Challenge Created!')
      .setDescription(`**${title}**\n${description}`)
      .addFields(
        { name: 'Reward', value: reward },
        { name: 'Duration', value: duration > 0 ? `${duration} hours` : 'No time limit' }
      )
      .setFooter({ text: `Created by ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [embed]
    });
  }
  else if (subcommand === 'list') {
    if (challenges.size === 0) {
      await interaction.reply({
        content: '📝 No active challenges!',
        ephemeral: true
      });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎯 Active Challenges')
      .setDescription(Array.from(challenges.values())
        .map(c => {
          const timeLeft = c.expiresAt ? 
            Math.ceil((c.expiresAt - Date.now()) / 3600000) : 
            'No time limit';
          return `**${c.title}**\n${c.description}\nReward: ${c.reward}\nTime Left: ${timeLeft} hours`;
        })
        .join('\n\n'))
      .setFooter({ text: 'Use /challenge complete <title> to complete a challenge' })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
  else if (subcommand === 'complete') {
    const title = interaction.options.getString('challenge');
    const challenge = challenges.get(title);
    
    if (!challenge) {
      await interaction.reply({
        content: '❌ Challenge not found!',
        ephemeral: true
      });
      return;
    }
    
    if (challenge.completed.has(interaction.user.id)) {
      await interaction.reply({
        content: '❌ You have already completed this challenge!',
        ephemeral: true
      });
      return;
    }
    
    if (challenge.expiresAt && Date.now() > challenge.expiresAt) {
      await interaction.reply({
        content: '❌ This challenge has expired!',
        ephemeral: true
      });
      return;
    }
    
    challenge.completed.add(interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🎉 Challenge Completed!')
      .setDescription(`**${title}**\n${challenge.description}`)
      .addFields(
        { name: 'Reward', value: challenge.reward },
        { name: 'Completed by', value: interaction.user.tag }
      )
      .setFooter({ text: 'Congratulations!' })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [embed]
    });
  }
} 