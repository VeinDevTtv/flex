import { SlashCommandBuilder } from 'discord.js';
import { stopPlaying, getQueueInfo } from '../../utils/musicPlayer.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playing and clear the queue');

export async function execute(interaction) {
  // Check if the user is in a voice channel
  if (!interaction.member.voice.channel) {
    return interaction.reply({
      content: '❌ You need to be in a voice channel to stop the music!',
      ephemeral: true
    });
  }
  
  // Check if the bot is in the same voice channel as the user
  const botVoiceChannel = interaction.guild.members.me?.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== interaction.member.voice.channel.id) {
    return interaction.reply({
      content: '❌ You need to be in the same voice channel as the bot to stop the music!',
      ephemeral: true
    });
  }
  
  // Check if there's music playing
  const queueInfo = getQueueInfo(interaction.guild.id);
  if (!queueInfo.isPlaying) {
    return interaction.reply({
      content: '❌ There is no music playing!',
      ephemeral: true
    });
  }
  
  // Stop the music
  const stopped = stopPlaying(interaction.guild.id);
  
  if (stopped) {
    return interaction.reply('⏹️ Stopped playing and cleared the queue.');
  } else {
    return interaction.reply({
      content: '❌ Failed to stop the music!',
      ephemeral: true
    });
  }
} 