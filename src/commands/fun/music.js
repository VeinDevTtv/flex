import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { settingsDb } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Create and manage collaborative music playlists')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create a new playlist')
      .addStringOption(option =>
        option.setName('name')
          .setDescription('Name of the playlist')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Add a song to a playlist')
      .addStringOption(option =>
        option.setName('playlist')
          .setDescription('Name of the playlist')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('song')
          .setDescription('Name of the song')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('artist')
          .setDescription('Artist of the song')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List all playlists'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('view')
      .setDescription('View a specific playlist')
      .addStringOption(option =>
        option.setName('playlist')
          .setDescription('Name of the playlist')
          .setRequired(true)));

// Store playlists in memory (you might want to move this to the database)
const playlists = new Map();

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'create') {
    const name = interaction.options.getString('name');
    
    if (playlists.has(name)) {
      await interaction.reply({
        content: '❌ A playlist with this name already exists!',
        ephemeral: true
      });
      return;
    }
    
    playlists.set(name, {
      name,
      creator: interaction.user.id,
      songs: [],
      createdAt: Date.now()
    });
    
    await interaction.reply({
      content: `✅ Playlist "${name}" created successfully!`,
      ephemeral: true
    });
  }
  else if (subcommand === 'add') {
    const playlistName = interaction.options.getString('playlist');
    const song = interaction.options.getString('song');
    const artist = interaction.options.getString('artist');
    
    const playlist = playlists.get(playlistName);
    
    if (!playlist) {
      await interaction.reply({
        content: '❌ Playlist not found!',
        ephemeral: true
      });
      return;
    }
    
    playlist.songs.push({
      name: song,
      artist,
      addedBy: interaction.user.id,
      addedAt: Date.now()
    });
    
    await interaction.reply({
      content: `✅ Added "${song}" by ${artist} to "${playlistName}"!`,
      ephemeral: true
    });
  }
  else if (subcommand === 'list') {
    if (playlists.size === 0) {
      await interaction.reply({
        content: '📝 No playlists have been created yet!',
        ephemeral: true
      });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎵 Available Playlists')
      .setDescription(Array.from(playlists.values())
        .map(p => `**${p.name}** - ${p.songs.length} songs`)
        .join('\n'))
      .setFooter({ text: 'Use /music view <playlist> to see songs' })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
  else if (subcommand === 'view') {
    const playlistName = interaction.options.getString('playlist');
    const playlist = playlists.get(playlistName);
    
    if (!playlist) {
      await interaction.reply({
        content: '❌ Playlist not found!',
        ephemeral: true
      });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`🎵 ${playlist.name}`)
      .setDescription(playlist.songs.length === 0 ? 
        'No songs in this playlist yet!' :
        playlist.songs.map((song, index) => 
          `${index + 1}. **${song.name}** by ${song.artist}`
        ).join('\n'))
      .setFooter({ text: `Created by ${interaction.user.tag}` })
      .setTimestamp();
    
    // Create buttons for playlist management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('add_song')
          .setLabel('Add Song')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('share')
          .setLabel('Share Playlist')
          .setStyle(ButtonStyle.Success)
      );
    
    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
} 