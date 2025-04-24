import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows all available commands');

export async function execute(interaction) {
  const utilityEmbed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📋 Utility Commands')
    .setDescription('Commands for useful server tools')
    .addFields(
      { name: '/remindme', value: 'Set a reminder that DMs you after a certain time\n`/remindme time:10m message:"do homework"`' },
      { name: '/poll', value: 'Create a multiple-choice poll with reactions\n`/poll question:"Best day?" option1:"Monday" option2:"Friday"`' },
      { name: '/quote save', value: 'Save a memorable quote from the server\n`/quote save message:"Words to remember"`' },
      { name: '/quote random', value: 'Get a random quote from the server\n`/quote random`' },
      { name: '/quote list', value: 'List all quotes from the server\n`/quote list`' },
      { name: '/settings', value: 'Configure server settings\n`/settings view` to see current settings' }
    );
  
  const funEmbed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🎮 Fun Commands')
    .setDescription('Commands for entertainment')
    .addFields(
      { name: '/vibecheck', value: 'Get your current vibe score\n`/vibecheck`' },
      { name: '/aestheticname', value: 'Convert text to aesthetic style unicode\n`/aestheticname input:"hello" style:Fullwidth`' },
      { name: '/emojiart', value: 'Convert text to emoji letter blocks\n`/emojiart input:"hi" style:Square`' },
      { name: '/ship', value: 'Calculate compatibility between two users\n`/ship user1:@user1 user2:@user2`' },
      { name: '/confess', value: 'Send an anonymous confession\n`/confess confession:"Your confession here"`' }
    );

  const interactiveEmbed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🎯 Interactive Commands')
    .setDescription('Advanced interactive features')
    .addFields(
      { name: '/roleplay', value: 'Start an interactive roleplay scenario\n`/roleplay scenario:Fantasy Adventure`' },
      { name: '/music create', value: 'Create a collaborative playlist\n`/music create name:"My Playlist"`' },
      { name: '/music add', value: 'Add a song to a playlist\n`/music add playlist:"My Playlist" song:"Song Name" artist:"Artist Name"`' },
      { name: '/music list', value: 'List all playlists\n`/music list`' },
      { name: '/music view', value: 'View a specific playlist\n`/music view playlist:"My Playlist"`' },
      { name: '/challenge create', value: 'Create a server challenge\n`/challenge create title:"Challenge" description:"Description" reward:"Reward" duration:24`' },
      { name: '/challenge list', value: 'List active challenges\n`/challenge list`' },
      { name: '/challenge complete', value: 'Complete a challenge\n`/challenge complete challenge:"Challenge Name"`' }
    )
    .setFooter({ text: 'Use these slash commands in any channel' });
  
  await interaction.reply({ 
    embeds: [utilityEmbed, funEmbed, interactiveEmbed],
    ephemeral: true
  });
} 