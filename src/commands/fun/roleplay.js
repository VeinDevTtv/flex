import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roleplay')
  .setDescription('Start an interactive roleplay scenario')
  .addStringOption(option =>
    option.setName('scenario')
      .setDescription('Choose a scenario')
      .setRequired(true)
      .addChoices(
        { name: 'Fantasy Adventure', value: 'fantasy' },
        { name: 'Space Exploration', value: 'space' },
        { name: 'Mystery Detective', value: 'mystery' },
        { name: 'Survival Horror', value: 'horror' }
      ));

// Scenario definitions
const scenarios = {
  fantasy: {
    title: '🏰 Fantasy Adventure',
    description: 'You find yourself in a mystical forest. A glowing portal appears before you...',
    choices: [
      { label: 'Enter the Portal', value: 'enter', style: ButtonStyle.Primary },
      { label: 'Explore the Forest', value: 'explore', style: ButtonStyle.Success },
      { label: 'Call for Help', value: 'help', style: ButtonStyle.Secondary }
    ],
    outcomes: {
      enter: {
        title: 'Through the Portal',
        description: 'You step through the portal and find yourself in a grand castle. A wise wizard approaches you...',
        choices: [
          { label: 'Listen to the Wizard', value: 'listen', style: ButtonStyle.Primary },
          { label: 'Explore the Castle', value: 'castle', style: ButtonStyle.Success },
          { label: 'Try to Return', value: 'return', style: ButtonStyle.Danger }
        ]
      },
      explore: {
        title: 'Forest Exploration',
        description: 'You discover an ancient tree with glowing runes. A small fairy appears...',
        choices: [
          { label: 'Talk to the Fairy', value: 'fairy', style: ButtonStyle.Primary },
          { label: 'Study the Runes', value: 'runes', style: ButtonStyle.Success },
          { label: 'Leave the Area', value: 'leave', style: ButtonStyle.Secondary }
        ]
      },
      help: {
        title: 'Calling for Help',
        description: 'Your calls echo through the forest. A group of travelers approaches...',
        choices: [
          { label: 'Join the Travelers', value: 'join', style: ButtonStyle.Primary },
          { label: 'Ask for Directions', value: 'directions', style: ButtonStyle.Success },
          { label: 'Hide from Them', value: 'hide', style: ButtonStyle.Danger }
        ]
      }
    }
  },
  space: {
    title: '🚀 Space Exploration',
    description: 'Your spaceship has detected an unknown signal from a nearby planet...',
    choices: [
      { label: 'Investigate the Signal', value: 'investigate', style: ButtonStyle.Primary },
      { label: 'Scan the Planet', value: 'scan', style: ButtonStyle.Success },
      { label: 'Continue Journey', value: 'continue', style: ButtonStyle.Secondary }
    ],
    outcomes: {
      investigate: {
        title: 'Signal Investigation',
        description: 'You discover an ancient alien structure. Strange symbols light up as you approach...',
        choices: [
          { label: 'Enter the Structure', value: 'enter', style: ButtonStyle.Primary },
          { label: 'Study the Symbols', value: 'study', style: ButtonStyle.Success },
          { label: 'Return to Ship', value: 'return', style: ButtonStyle.Danger }
        ]
      },
      scan: {
        title: 'Planet Scan',
        description: 'The scan reveals unusual energy readings. A small alien creature approaches...',
        choices: [
          { label: 'Make Contact', value: 'contact', style: ButtonStyle.Primary },
          { label: 'Observe from Afar', value: 'observe', style: ButtonStyle.Success },
          { label: 'Prepare Defenses', value: 'defend', style: ButtonStyle.Danger }
        ]
      },
      continue: {
        title: 'Continuing Journey',
        description: 'As you prepare to leave, your ship detects a distress signal...',
        choices: [
          { label: 'Respond to Signal', value: 'respond', style: ButtonStyle.Primary },
          { label: 'Ignore and Leave', value: 'ignore', style: ButtonStyle.Danger },
          { label: 'Record and Report', value: 'record', style: ButtonStyle.Secondary }
        ]
      }
    }
  }
};

export async function execute(interaction) {
  const scenarioType = interaction.options.getString('scenario');
  const scenario = scenarios[scenarioType];
  
  if (!scenario) {
    await interaction.reply({
      content: '❌ Invalid scenario selected.',
      ephemeral: true
    });
    return;
  }
  
  // Create initial embed
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(scenario.title)
    .setDescription(scenario.description)
    .setFooter({ text: 'Choose your path wisely...' })
    .setTimestamp();
  
  // Create buttons
  const row = new ActionRowBuilder()
    .addComponents(
      scenario.choices.map(choice =>
        new ButtonBuilder()
          .setCustomId(choice.value)
          .setLabel(choice.label)
          .setStyle(choice.style)
      )
    );
  
  // Send initial message
  const message = await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true
  });
  
  // Create button collector
  const collector = message.createMessageComponentCollector({
    time: 300000 // 5 minutes
  });
  
  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      await i.reply({
        content: '❌ This is not your roleplay scenario!',
        ephemeral: true
      });
      return;
    }
    
    const outcome = scenario.outcomes[i.customId];
    
    if (!outcome) {
      await i.reply({
        content: '❌ Invalid choice selected.',
        ephemeral: true
      });
      return;
    }
    
    // Update embed with outcome
    const newEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(outcome.title)
      .setDescription(outcome.description)
      .setFooter({ text: 'Your story continues...' })
      .setTimestamp();
    
    // Create new buttons for the outcome
    const newRow = new ActionRowBuilder()
      .addComponents(
        outcome.choices.map(choice =>
          new ButtonBuilder()
            .setCustomId(choice.value)
            .setLabel(choice.label)
            .setStyle(choice.style)
        )
      );
    
    await i.update({
      embeds: [newEmbed],
      components: [newRow]
    });
  });
  
  collector.on('end', async () => {
    // Remove buttons when time expires
    await interaction.editReply({
      components: []
    });
  });
} 