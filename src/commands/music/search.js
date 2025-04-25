import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { joinVoiceChannelForUser, addSong } from '../../utils/musicPlayer.js';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for a song on YouTube')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('The song to search for')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  
  const query = interaction.options.getString('query');
  
  try {
    // Search for videos with play-dl
    const searchResults = await play.search(query, { limit: 5 });
    
    if (!searchResults || searchResults.length === 0) {
      return interaction.followUp('❌ No results found for your search query.');
    }
    
    // Create an embed with the search results
    const embed = new EmbedBuilder()
      .setTitle('🔎 Search Results')
      .setColor('#3498db')
      .setDescription(`Here are the results for: **${query}**`)
      .setTimestamp();
    
    // Add each result to the embed
    searchResults.forEach((video, index) => {
      embed.addFields({
        name: `${index + 1}. ${video.title}`,
        value: `Duration: ${video.durationRaw} | Channel: ${video.channel.name}`
      });
    });
    
    // Create buttons for selection - First row for selection buttons (1-4)
    const selectionRow = new ActionRowBuilder();
    
    for (let i = 0; i < Math.min(4, searchResults.length); i++) {
      selectionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`search_${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    // Create a second row for the fifth button (if it exists) and cancel button
    const cancelRow = new ActionRowBuilder();
    
    // Add fifth button if needed
    if (searchResults.length >= 5) {
      cancelRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`search_4`)
          .setLabel(`5`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    // Add cancel button
    cancelRow.addComponents(
      new ButtonBuilder()
        .setCustomId('search_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );
    
    // Create array of component rows
    const components = [selectionRow];
    if (cancelRow.components.length > 0) {
      components.push(cancelRow);
    }
    
    // Send the message with the embed and buttons
    const response = await interaction.followUp({
      embeds: [embed],
      components: components
    });
    
    // Create a filter for the collector
    const filter = i => {
      // Only allow the user who initiated the command to interact with the buttons
      if (i.user.id !== interaction.user.id) {
        i.reply({ content: '❌ You cannot use these buttons.', ephemeral: true });
        return false;
      }
      return i.customId.startsWith('search_');
    };
    
    // Create a collector for button interactions
    const collector = response.createMessageComponentCollector({
      filter,
      time: 60000 // 1 minute timeout
    });
    
    // Handle button interactions
    collector.on('collect', async i => {
      // Stop the collector
      collector.stop();
      
      // Handle cancel button
      if (i.customId === 'search_cancel') {
        await i.update({
          content: '🚫 Search cancelled.',
          embeds: [],
          components: []
        });
        return;
      }
      
      // Get the selected video
      const index = parseInt(i.customId.split('_')[1]);
      const selectedVideo = searchResults[index];
      
      await i.update({
        content: `🎵 Selected: **${selectedVideo.title}**`,
        embeds: [],
        components: []
      });
      
      // Get voice connection
      const connection = await joinVoiceChannelForUser(interaction);
      if (!connection) return;
      
      // Create song object
      const song = {
        title: selectedVideo.title,
        url: selectedVideo.url
      };
      
      // Add song to queue and start playing
      await addSong(interaction, song, true);
      
      await interaction.followUp(`🎵 Added to queue: **${song.title}**`);
    });
    
    // Handle collector timeout
    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: '⏱️ Search timed out. Please try again.',
          embeds: [],
          components: []
        });
      }
    });
  } catch (error) {
    console.error('Error searching for songs:', error);
    return interaction.followUp(`❌ Error searching for songs: ${error.message}`);
  }
} 