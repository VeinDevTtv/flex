import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  AudioPlayerStatus,
  NoSubscriberBehavior
} from '@discordjs/voice';
import play from 'play-dl';

// Track active voice connections per guild
const connections = new Map();

export const data = new SlashCommandBuilder()
  .setName('song')
  .setDescription('Play a YouTube song in your current voice channel')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Valid YouTube video URL')
      .setRequired(true)
  );

export async function execute(interaction) {
  // Defer with ephemeral reply to avoid timeouts
  await interaction.deferReply({ ephemeral: true });

  const userChannel = interaction.member.voice.channel;
  if (!userChannel) {
    return interaction.editReply('❌ You must be in a voice channel to use this command!');
  }

  // Permission checks
  const botMember = interaction.guild.members.me;
  const permissions = botMember.permissionsIn(userChannel);
  
  // Check for basic permissions first
  if (!permissions.has(['ViewChannel', 'Connect', 'Speak'])) {
    let missingPerms = [];
    if (!permissions.has('ViewChannel')) missingPerms.push('View Channel');
    if (!permissions.has('Connect')) missingPerms.push('Connect');
    if (!permissions.has('Speak')) missingPerms.push('Speak');
    
    return interaction.editReply(`❌ I need the following permissions in the voice channel: ${missingPerms.join(', ')}.
Try using the /checkvoice command for more detailed permission information.`);
  }

  // Prevent multiple connections in the same guild
  if (connections.has(interaction.guildId)) {
    const existing = connections.get(interaction.guildId);
    if (existing.connection.state.status !== VoiceConnectionStatus.Destroyed) {
      return interaction.editReply('❌ Already playing music in a voice channel. Please wait until the current track ends.');
    }
    // Clean up destroyed connection
    connections.delete(interaction.guildId);
  }

  const url = interaction.options.getString('url');
  // Validate YouTube URL and type
  try {
    const validation = play.yt_validate(url);
    if (validation !== 'video') {
      return interaction.editReply('❌ Please provide a valid YouTube **video** URL!');
    }
  } catch (error) {
    console.error('URL validation error:', error);
    return interaction.editReply('❌ Failed to validate the YouTube URL. Please make sure it\'s correct.');
  }

  try {
    // Fetch video details
    const info = await play.video_basic_info(url);
    const { video_details: details } = info;

    // Check video duration (optional: limit to reasonable length)
    if (details.durationInSec > 3600) { // 1 hour limit
      return interaction.editReply('❌ Video is too long! Please choose a video under 1 hour.');
    }

    // Update the user about progress
    await interaction.editReply('🔄 Preparing the audio stream, please wait...');

    // Prepare audio stream with multiple fallbacks
    let stream;
    try {
      // First attempt: Standard stream with compatibility mode
      stream = await play.stream(url, { 
        quality: 2,
        discordPlayerCompatibility: true
      });
    } catch (streamError) {
      console.error('Primary stream error:', streamError);
      
      // Check if it's a connection reset error
      if (streamError.code === 'ECONNRESET') {
        await interaction.editReply('🔄 Connection issue detected, trying alternative method...');
        
        // Wait a moment before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      try {
        // Second attempt: Lower quality without compatibility mode
        stream = await play.stream(url, { 
          quality: 0, // Lowest quality
          discordPlayerCompatibility: false
        });
        console.log('Using lower quality streaming method');
      } catch (secondError) {
        console.error('Secondary stream error:', secondError);
        
        try {
          // Third attempt: Bare minimum options
          await interaction.editReply('🔄 Trying final fallback method...');
          stream = await play.stream(url, { htmldata: false });
          console.log('Using minimal streaming method');
        } catch (finalError) {
          console.error('All stream attempts failed:', finalError);
          throw new Error('Failed to create audio stream after multiple attempts. The video might be restricted or there are network issues.');
        }
      }
    }
    
    if (!stream || !stream.stream) {
      throw new Error('Failed to get audio stream from the video');
    }
    
    // Update the user
    await interaction.editReply('🔄 Creating audio resource...');
    
    // Create audio resource
    let resource;
    try {
      resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
      });
      resource.volume?.setVolume(0.5); // Set default volume to 50%
    } catch (error) {
      console.error('Error creating audio resource:', error);
      throw new Error('Failed to process audio stream. Please try another video.');
    }
    
    await interaction.editReply('🔄 Joining voice channel...');
    
    // Create voice connection with a manual timeout
    const connection = joinVoiceChannel({
      channelId: userChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    
    // Set a manual connection timeout
    let connectionTimeout = setTimeout(() => {
      console.error('Voice connection manual timeout');
      connection.destroy();
      throw new Error('Voice connection timed out after 15 seconds. Server might be having issues.');
    }, 15000);
    
    // Create audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      }
    });
    
    // Set up connection state monitoring
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`Voice connection ready in guild ${interaction.guildId}`);
      clearTimeout(connectionTimeout);
      
      // Play the audio once connection is ready
      player.play(resource);
      
      // Update user
      interaction.editReply('🔄 Now playing the song...');
    });
    
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        console.log('Voice connection disconnected, attempting to reconnect...');
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        console.log('Voice connection is reconnecting...');
      } catch (error) {
        console.log('Voice connection cannot reconnect, cleaning up...', error);
        clearTimeout(connectionTimeout);
        connection.destroy();
        connections.delete(interaction.guildId);
        interaction.channel?.send('❌ Voice connection was lost and could not be reestablished.').catch(() => {});
      }
    });
    
    connection.on('error', error => {
      console.error(`Voice connection error in guild ${interaction.guildId}:`, error);
      clearTimeout(connectionTimeout);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel?.send(`❌ Voice connection error: ${error.message}`).catch(() => {});
    });
    
    // Set up player error handling
    player.on('error', error => {
      console.error('Audio player error:', error);
      try {
        connection.destroy();
        connections.delete(interaction.guildId);
        interaction.channel?.send(`❌ An error occurred while playing: ${error.message}`).catch(() => {});
      } catch (cleanupError) {
        console.error('Error during player cleanup:', cleanupError);
      }
    });
    
    // Cleanup when finished
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`Song finished in guild ${interaction.guildId}, cleaning up...`);
      try {
        connection.destroy();
        connections.delete(interaction.guildId);
        interaction.channel?.send('✅ Song playback completed.').catch(() => {});
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    
    // Subscribe player to connection
    const subscription = connection.subscribe(player);
    if (!subscription) {
      clearTimeout(connectionTimeout);
      connection.destroy();
      throw new Error("Failed to subscribe audio player to voice connection");
    }
    
    // Store the connection
    connections.set(interaction.guildId, { connection, player });
    
    // Wait for connection to be ready
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
      clearTimeout(connectionTimeout);
    } catch (error) {
      // This is handled by the timeout already, but just in case
      console.error("Failed to enter Ready state:", error);
      // Don't throw here, let the timeout handle it
    }
    
    // Build and send now-playing embed
    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('▶️ Now Playing')
      .setDescription(`[${details.title}](${url})`)
      .setThumbnail(details.thumbnails[0]?.url)
      .addFields(
        { name: 'Channel', value: details.channel.name, inline: true },
        { name: 'Duration', value: details.durationRaw, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    
    // Send public embed
    await interaction.editReply({ embeds: [embed], ephemeral: false });
    
    // Log success
    console.log(`Now playing song in guild ${interaction.guildId}: ${details.title}`);
  
  } catch (error) {
    console.error('Error in /song command:', error);
    // Attempt cleanup
    if (connections.has(interaction.guildId)) {
      const { connection } = connections.get(interaction.guildId);
      connection.destroy();
      connections.delete(interaction.guildId);
    }
    
    // Handle the response based on interaction state
    try {
      if (interaction.deferred) {
        await interaction.editReply(`❌ An error occurred: ${error.message}`);
      } else {
        await interaction.reply({
          content: `❌ An error occurred: ${error.message}`,
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error sending error response:', replyError);
      // If we can't edit the reply, try following up instead
      try {
        await interaction.followUp({
          content: `❌ An error occurred: ${error.message}`,
          ephemeral: true
        });
      } catch (followUpError) {
        console.error('Failed to send error message:', followUpError);
      }
    }
  }
}