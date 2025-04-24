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
  if (!permissions.has(['CONNECT', 'SPEAK'])) {
    return interaction.editReply('❌ I need permissions to connect and speak in your channel.');
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

    // Prepare audio stream
    const stream = await play.stream(url, { 
      quality: 2,
      discordPlayerCompatibility: true // Add compatibility mode for Discord player
    }).catch(error => {
      console.error('Stream error:', error);
      throw new Error('Failed to create audio stream. The video might be unavailable or restricted.');
    });
    
    if (!stream || !stream.stream) {
      throw new Error('Failed to get audio stream from the video');
    }
    
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

    // Establish voice connection
    const connection = joinVoiceChannel({
      channelId: userChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    // Monitor connection state
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel
      } catch (error) {
        // Seems to be a real disconnection
        connection.destroy();
        connections.delete(interaction.guildId);
      }
    });

    // Check if we're connected
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`Voice connection ready in guild ${interaction.guildId}`);
    });

    connection.on('error', error => {
      console.error(`Voice connection error in guild ${interaction.guildId}:`, error);
      connection.destroy();
      connections.delete(interaction.guildId);
    });

    // Create and configure audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    // Await ready state with timeout
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000); // Increased from 10 to 30 seconds
    } catch (error) {
      console.error('Voice connection timeout:', error);
      connection.destroy();
      throw new Error(`Failed to join the voice channel. Please make sure I have the right permissions and try again.`);
    }

    player.play(resource);
    connection.subscribe(player);

    // Track this connection
    connections.set(interaction.guildId, { connection, player });

    // Cleanup when finished or on error
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
      connections.delete(interaction.guildId);
    });

    player.on('error', error => {
      console.error('Audio player error:', error);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel?.send(`❌ An error occurred while playing: ${error.message}`).catch(() => {});
    });

    // Build now-playing embed
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

  } catch (error) {
    console.error('Error in /song command:', error);
    // Attempt cleanup
    if (connections.has(interaction.guildId)) {
      const { connection } = connections.get(interaction.guildId);
      connection.destroy();
      connections.delete(interaction.guildId);
    }
    return interaction.editReply(`❌ An error occurred: ${error.message}`);
  }
}