import { SlashCommandBuilder } from 'discord.js';
import { skipSong, getQueueInfo } from '../../utils/musicPlayer.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the current song');

export async function execute(interaction) {
  // Check if the user is in a voice channel
  if (!interaction.member.voice.channel) {
    return interaction.reply({
      content: '❌ You need to be in a voice channel to skip songs!',
      ephemeral: true
    });
  }
  
  // Check if the bot is in the same voice channel as the user
  const botVoiceChannel = interaction.guild.members.me?.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== interaction.member.voice.channel.id) {
    return interaction.reply({
      content: '❌ You need to be in the same voice channel as the bot to skip songs!',
      ephemeral: true
    });
  }
  
  // Check if there's music playing
  const queueInfo = getQueueInfo(interaction.guild.id);
  if (!queueInfo.isPlaying || !queueInfo.currentSong) {
    return interaction.reply({
      content: '❌ There is no song currently playing!',
      ephemeral: true
    });
  }
  
  // Skip the current song
  const currentSong = queueInfo.currentSong;
  const skipped = skipSong(interaction.guild.id);
  
  if (skipped) {
    return interaction.reply(`⏭️ Skipped: **${currentSong.title}**`);
  } else {
    return interaction.reply({
      content: '❌ Failed to skip the song!',
      ephemeral: true
    });
  }
} 