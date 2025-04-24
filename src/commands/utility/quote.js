import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { saveQuote, getRandomQuote, getGuildQuotes } from '../../utils/quoteManager.js';

export const data = new SlashCommandBuilder()
  .setName('quote')
  .setDescription('Save or get memorable quotes from the server')
  .addSubcommand(subcommand =>
    subcommand
      .setName('save')
      .setDescription('Save a new quote')
      .addStringOption(option => 
        option.setName('message')
          .setDescription('The quote to save')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('random')
      .setDescription('Get a random quote from this server'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List all quotes from this server'));

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'save') {
    const message = interaction.options.getString('message');
    
    const newQuote = saveQuote({
      message,
      author: interaction.user.tag,
      authorId: interaction.user.id,
      timestamp: Date.now(),
      guildId: interaction.guildId
    });
    
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('Quote Saved')
      .setDescription(`"${message}"`)
      .setFooter({ text: `Quote #${newQuote.id} - Added by ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  } 
  else if (subcommand === 'random') {
    const quote = getRandomQuote(interaction.guildId);
    
    if (!quote) {
      await interaction.reply({ 
        content: 'No quotes found for this server. Try saving one first!',
        ephemeral: true 
      });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`Quote #${quote.id}`)
      .setDescription(`"${quote.message}"`)
      .setFooter({ text: `Added by ${quote.author} on ${new Date(quote.timestamp).toLocaleDateString()}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
  else if (subcommand === 'list') {
    const quotes = getGuildQuotes(interaction.guildId);
    
    if (quotes.length === 0) {
      await interaction.reply({ 
        content: 'No quotes found for this server. Try saving one first!',
        ephemeral: true 
      });
      return;
    }
    
    // Create a list of quotes
    const quotesList = quotes.map(quote => {
      return `**Quote #${quote.id}**: "${quote.message}" - *${quote.author}*`;
    }).join('\n\n');
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`Quotes in ${interaction.guild.name}`)
      .setDescription(quotesList)
      .setFooter({ text: `Total: ${quotes.length} quotes` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
} 