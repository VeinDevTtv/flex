import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getQueueInfo } from '../../utils/musicPlayer.js';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Show the current music queue');

export async function execute(interaction) {
  const queueInfo = getQueueInfo(interaction.guild.id);
  
  if (!queueInfo.isPlaying && !queueInfo.currentSong) {
    return interaction.reply({
      content: '❌ There are no songs in the queue!',
      ephemeral: true
    });
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🎵 Music Queue')
    .setColor('#3498db')
    .setTimestamp();
  
  // Add current song
  if (queueInfo.currentSong) {
    embed.addFields({ 
      name: '🎧 Now Playing', 
      value: `**${queueInfo.currentSong.title}**` 
    });
  }
  
  // Add upcoming songs
  if (queueInfo.songs.length > 0) {
    const songsField = queueInfo.songs
      .slice(0, 10)
      .map((song, index) => `${index + 1}. **${song.title}**`)
      .join('\n');
    
    embed.addFields({ 
      name: '📋 Up Next', 
      value: songsField 
    });
    
    // If there are more than 10 songs, add a note
    if (queueInfo.songs.length > 10) {
      embed.setFooter({ 
        text: `And ${queueInfo.songs.length - 10} more songs in the queue` 
      });
    }
  } else {
    embed.addFields({ 
      name: '📋 Up Next', 
      value: 'No songs in the queue. Add more with `/play`!' 
    });
  }
  
  return interaction.reply({ embeds: [embed] });
} 