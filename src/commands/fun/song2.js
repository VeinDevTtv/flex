import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  NoSubscriberBehavior
} from '@discordjs/voice';
import ytdl from 'ytdl-core';

// Track active voice connections per guild
const connections = new Map();

export const data = new SlashCommandBuilder()
  .setName('song2')
  .setDescription('Play a YouTube song using alternative method')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Valid YouTube video URL')
      .setRequired(true)
  );

export async function execute(interaction) {
  // Defer with ephemeral reply to avoid timeouts
  await interaction.deferReply({ ephemeral: true });

  const url = interaction.options.getString('url');
  const userChannel = interaction.member.voice.channel;
  
  // Check if user is in a voice channel
  if (!userChannel) {
    return interaction.editReply('❌ You need to be in a voice channel to use this command!');
  }
  
  // Check bot permissions
  const permissions = interaction.guild.members.me.permissionsIn(userChannel);
  if (!permissions.has(['ViewChannel', 'Connect', 'Speak'])) {
    return interaction.editReply('❌ I need permissions to view, connect, and speak in your voice channel!');
  }
  
  // Prevent multiple connections in the same guild
  if (connections.has(interaction.guildId)) {
    const existing = connections.get(interaction.guildId);
    try {
      existing.connection.destroy();
      existing.player.stop();
    } catch (e) {
      console.error('Error cleaning up existing connection:', e);
    }
    connections.delete(interaction.guildId);
  }
  
  try {
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return interaction.editReply('❌ Please provide a valid YouTube URL.');
    }
    
    await interaction.editReply('🔍 Fetching video info...');
    
    // Get video info
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const channelName = info.videoDetails.author.name;
    const duration = formatDuration(info.videoDetails.lengthSeconds);
    const thumbnail = info.videoDetails.thumbnails[0]?.url;
    
    // Create connection
    await interaction.editReply('🔊 Connecting to voice channel...');
    
    const connection = joinVoiceChannel({
      channelId: userChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    
    // Create audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play, // Keep playing even when no one is listening
      }
    });
    
    // Set up connection error handling
    connection.on('error', (error) => {
      console.error(`Voice connection error: ${error.message}`);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send(`❌ Voice connection error: ${error.message}`).catch(() => {});
    });
    
    // Create audio stream
    await interaction.editReply('🎵 Creating audio stream...');
    
    // Use highest audio quality with minimal filtering
    const stream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25, // 32MB buffer
      dlChunkSize: 0 // Disable chunking for smoother playback
    });
    
    // Handle stream errors
    stream.on('error', (error) => {
      console.error(`Stream error: ${error.message}`);
      interaction.channel.send(`❌ Error streaming audio: ${error.message}`).catch(() => {});
      connection.destroy();
      connections.delete(interaction.guildId);
    });
    
    // Create audio resource
    const resource = createAudioResource(stream, {
      inlineVolume: true
    });
    
    // Set volume to 100%
    resource.volume?.setVolume(1);
    
    // Play the audio
    player.play(resource);
    connection.subscribe(player);
    
    // Store connection
    connections.set(interaction.guildId, { connection, player });
    
    // Handle playback status
    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`Now playing in guild ${interaction.guildId}: ${videoTitle}`);
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`Playback finished in guild ${interaction.guildId}`);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send(`✅ Finished playing: ${videoTitle}`).catch(() => {});
    });
    
    player.on('error', (error) => {
      console.error(`Player error: ${error.message}`);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send(`❌ Playback error: ${error.message}`).catch(() => {});
    });
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('▶️ Now Playing (Alternative Method)')
      .setDescription(`[${videoTitle}](${url})`)
      .addFields(
        { name: 'Channel', value: channelName, inline: true },
        { name: 'Duration', value: duration, inline: true }
      )
      .setThumbnail(thumbnail)
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    
    // Send public embed
    await interaction.editReply({ embeds: [embed], ephemeral: false });
    
  } catch (error) {
    console.error('Command error:', error);
    
    // Clean up
    if (connections.has(interaction.guildId)) {
      const { connection } = connections.get(interaction.guildId);
      connection.destroy();
      connections.delete(interaction.guildId);
    }
    
    // Send error message
    await interaction.editReply(`❌ Error: ${error.message}`);
  }
}

// Format seconds to MM:SS
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 