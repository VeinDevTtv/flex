import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannelForUser, addSong } from '../../utils/musicPlayer.js';
import ytdl from 'ytdl-core';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('The URL of the song to play (YouTube)')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  
  const url = interaction.options.getString('url');
  
  // Validate URL
  if (!ytdl.validateURL(url)) {
    return interaction.followUp('❌ Please provide a valid YouTube URL.');
  }
  
  // Get the voice connection
  const connection = await joinVoiceChannelForUser(interaction);
  if (!connection) return;
  
  try {
    // Get song info
    let songInfo;
    
    try {
      songInfo = await ytdl.getInfo(url);
    } catch (error) {
      console.error('Error getting song info with ytdl:', error);
      
      // Try with play-dl as a fallback
      const songData = await play.video_info(url);
      if (!songData) {
        return interaction.followUp('❌ Error getting song information.');
      }
      
      songInfo = {
        videoDetails: {
          title: songData.video_details.title,
          video_url: songData.video_details.url
        }
      };
    }
    
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url
    };
    
    // Add song to queue and start playing if it's the first song
    await addSong(interaction, song, true);
    
    return interaction.followUp(`🎵 Added to queue: **${song.title}**`);
  } catch (error) {
    console.error('Error adding song:', error);
    return interaction.followUp(`❌ Error adding song: ${error.message}`);
  }
} 