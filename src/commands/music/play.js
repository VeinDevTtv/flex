import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannelForUser, addSong } from '../../utils/musicPlayer.js';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube')
  .addStringOption(option =>
    option.setName('input')
      .setDescription('YouTube URL or search keywords')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  
  const input = interaction.options.getString('input');
  
  try {
    // Check if input is a valid YouTube URL
    const isUrl = play.yt_validate(input);
    let videoInfo;
    
    if (isUrl) {
      // Handle URL input
      videoInfo = await play.video_info(input);
      
      if (!videoInfo) {
        return interaction.followUp('❌ Could not get information for this video.');
      }
    } else {
      // Handle search terms
      await interaction.followUp('🔍 Searching for: ' + input);
      
      // Search for the video
      const searchResults = await play.search(input, { limit: 1 });
      
      if (!searchResults || searchResults.length === 0) {
        return interaction.followUp('❌ No results found for your search query.');
      }
      
      // Get the first result
      videoInfo = await play.video_info(searchResults[0].url);
    }
    
    // Get voice connection
    const connection = await joinVoiceChannelForUser(interaction);
    if (!connection) return;
    
    // Create song object
    const song = {
      title: videoInfo.video_details.title,
      url: videoInfo.video_details.url
    };
    
    // Add song to queue and start playing if it's the first song
    await addSong(interaction, song, true);
    
    return interaction.followUp(`🎵 Added to queue: **${song.title}**`);
  } catch (error) {
    console.error('Error adding song:', error);
    return interaction.followUp(`❌ Error adding song: ${error.message}`);
  }
} 