import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType
} from '@discordjs/voice';
import fetch from 'node-fetch';

// Track active voice connections per guild
const connections = new Map();

export const data = new SlashCommandBuilder()
  .setName('mp3')
  .setDescription('Play an MP3 from a direct URL')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Direct URL to an MP3 file')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const url = interaction.options.getString('url');
  
  // Check if user is in a voice channel
  const userChannel = interaction.member.voice.channel;
  if (!userChannel) {
    return interaction.editReply('❌ You must be in a voice channel to use this command!');
  }

  // Check permissions
  const permissions = interaction.guild.members.me.permissionsIn(userChannel);
  if (!permissions.has(['ViewChannel', 'Connect', 'Speak'])) {
    return interaction.editReply('❌ I need permissions to view, connect, and speak in your voice channel!');
  }

  // Validate URL format
  if (!url.match(/^https?:\/\/.+\.(mp3|wav|ogg)(\?.*)?$/i)) {
    return interaction.editReply('❌ Please provide a direct link to an MP3, WAV, or OGG file.');
  }

  // Clean up existing connections
  if (connections.has(interaction.guildId)) {
    try {
      const { connection, player } = connections.get(interaction.guildId);
      connection.destroy();
      player.stop();
    } catch (e) {
      console.error('Error cleaning up existing connection:', e);
    }
    connections.delete(interaction.guildId);
  }

  await interaction.editReply('🔍 Checking audio file...');

  try {
    // Check if the URL actually returns audio content
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      return interaction.editReply(`❌ Failed to access the audio file. Status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
      // Still proceed but warn the user
      await interaction.editReply('⚠️ The URL provided may not be an audio file, but I\'ll try to play it anyway.');
    }

    await interaction.editReply('🔊 Connecting to voice channel...');

    // Create voice connection
    const connection = joinVoiceChannel({
      channelId: userChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    // Create audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });

    // Handle connection errors
    connection.on('error', error => {
      console.error(`Voice connection error: ${error.message}`);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send(`❌ Voice connection error: ${error.message}`).catch(() => {});
    });

    await interaction.editReply('🎵 Preparing audio stream...');

    // Fetch the stream
    const audioResponse = await fetch(url);
    if (!audioResponse.ok) {
      return interaction.editReply(`❌ Failed to fetch the audio file. Status: ${audioResponse.status}`);
    }

    // Create audio resource
    const resource = createAudioResource(audioResponse.body, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });
    
    resource.volume?.setVolume(0.5);

    // Play the audio
    player.play(resource);
    connection.subscribe(player);

    // Store connection
    connections.set(interaction.guildId, { connection, player });

    // Handle playback status
    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`Now playing MP3 from URL in guild ${interaction.guildId}`);
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`MP3 playback finished in guild ${interaction.guildId}`);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send('✅ Audio playback completed.').catch(() => {});
    });

    player.on('error', error => {
      console.error('Player error:', error);
      connection.destroy();
      connections.delete(interaction.guildId);
      interaction.channel.send(`❌ Error during playback: ${error.message}`).catch(() => {});
    });

    // Create embed
    const fileName = url.split('/').pop().split('?')[0];
    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle('🎵 Now Playing MP3')
      .setDescription(`Playing audio from [direct link](${url})`)
      .addFields(
        { name: 'File', value: fileName || 'Unknown', inline: true },
        { name: 'Channel', value: userChannel.name, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Send public embed
    await interaction.editReply({ embeds: [embed], ephemeral: false });

  } catch (error) {
    console.error('Error playing MP3:', error);
    
    // Clean up
    if (connections.has(interaction.guildId)) {
      const { connection } = connections.get(interaction.guildId);
      connection.destroy();
      connections.delete(interaction.guildId);
    }
    
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
} 