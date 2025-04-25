import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannelForUser, addSong } from '../../utils/musicPlayer.js';
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
  if (!play.yt_validate(url)) {
    return interaction.followUp('❌ Please provide a valid YouTube URL.');
  }
  
  // Get the voice connection
  const connection = await joinVoiceChannelForUser(interaction);
  if (!connection) return;
  
  try {
    // Get song info using play-dl
    const songInfo = await play.video_info(url);
    
    if (!songInfo) {
      return interaction.followUp('❌ Could not get information for this video.');
    }
    
    const song = {
      title: songInfo.video_details.title,
      url: songInfo.video_details.url
    };
    
    // Add song to queue and start playing if it's the first song
    await addSong(interaction, song, true);
    
    return interaction.followUp(`🎵 Added to queue: **${song.title}**`);
  } catch (error) {
    console.error('Error adding song:', error);
    return interaction.followUp(`❌ Error adding song: ${error.message}`);
  }
} 