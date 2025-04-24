import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  AudioPlayerStatus
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
  if (!permissions.has(['CONNECT', 'SPEAK', 'DEAFEN_MEMBERS'])) {
    return interaction.editReply('❌ I need permissions to connect, speak, and deafen in your channel.');
  }

  // Prevent multiple connections in the same guild
  if (connections.has(interaction.guildId)) {
    return interaction.editReply('❌ Already playing music in a voice channel. Please wait until the current track ends.');
  }

  const url = interaction.options.getString('url');
  // Validate YouTube URL and type
  const validation = play.yt_validate(url);
  if (validation !== 'video') {
    return interaction.editReply('❌ Please provide a valid YouTube **video** URL!');
  }

  try {
    // Fetch video details
    const info = await play.video_basic_info(url);
    const { video_details: details } = info;

    // Prepare audio stream
    const stream = await play.stream(url, { quality: 2 });
    const resource = createAudioResource(stream.stream, { inputType: stream.type });

    // Establish voice connection
    const connection = joinVoiceChannel({
      channelId: userChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    // Await ready state
    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

    // Create and subscribe audio player
    const player = createAudioPlayer();
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
    return interaction.editReply('❌ An error occurred while trying to play the song.');
  }
}