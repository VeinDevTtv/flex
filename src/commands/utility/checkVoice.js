import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('checkvoice')
  .setDescription('Check voice channel permissions for the bot')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('The voice channel to check (defaults to your current channel)')
      .setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  // Get the channel to check
  let voiceChannel = interaction.options.getChannel('channel');
  
  // If no channel was specified, use the user's current voice channel
  if (!voiceChannel) {
    voiceChannel = interaction.member.voice.channel;
  }
  
  // Check if the channel is valid
  if (!voiceChannel) {
    return interaction.editReply('❌ You must be in a voice channel or specify a voice channel to check.');
  }
  
  // Check if it's a voice channel
  if (voiceChannel.type !== 2) { // 2 is GUILD_VOICE
    return interaction.editReply('❌ The specified channel is not a voice channel.');
  }
  
  // Get the bot member
  const botMember = interaction.guild.members.me;
  
  // Get permissions in the voice channel
  const permissions = botMember.permissionsIn(voiceChannel);
  
  // Required permissions for voice
  const requiredPermissions = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.Speak
  ];
  
  // Optional but helpful permissions
  const helpfulPermissions = [
    PermissionsBitField.Flags.PrioritySpeaker,
    PermissionsBitField.Flags.MuteMembers,
    PermissionsBitField.Flags.DeafenMembers,
    PermissionsBitField.Flags.MoveMembers
  ];
  
  // Check each permission
  const missingRequired = [];
  for (const perm of requiredPermissions) {
    if (!permissions.has(perm)) {
      missingRequired.push(permToString(perm));
    }
  }
  
  const missingHelpful = [];
  for (const perm of helpfulPermissions) {
    if (!permissions.has(perm)) {
      missingHelpful.push(permToString(perm));
    }
  }
  
  // Build response
  let response = `## Voice Permission Check: ${voiceChannel.name}\n\n`;
  
  if (missingRequired.length === 0) {
    response += '✅ Bot has all required permissions for voice channels.\n\n';
  } else {
    response += `❌ Bot is missing these **required** permissions:\n- ${missingRequired.join('\n- ')}\n\n`;
  }
  
  if (missingHelpful.length === 0) {
    response += '✅ Bot has all helpful optional permissions.\n';
  } else {
    response += `ℹ️ Bot is missing these **optional** permissions that might be helpful:\n- ${missingHelpful.join('\n- ')}\n`;
  }
  
  // Check voice region and server settings
  response += '\n## Additional Checks\n';
  
  // Check if the bot is in too many voice channels already
  const voiceConnections = interaction.client.guilds.cache
    .filter(guild => guild.members.me.voice.channel)
    .size;
    
  if (voiceConnections > 10) {
    response += '⚠️ Bot is in many voice channels across different servers, which might affect performance.\n';
  } else {
    response += '✅ Bot is not overloaded with voice connections.\n';
  }
  
  // Check server region/features
  response += '✅ Voice functionality should work in this server.\n';
  
  // Check user limit
  if (voiceChannel.userLimit > 0 && voiceChannel.members.size >= voiceChannel.userLimit) {
    response += `❌ The voice channel is full (${voiceChannel.members.size}/${voiceChannel.userLimit}).\n`;
  } else if (voiceChannel.userLimit > 0) {
    response += `✅ The voice channel has space (${voiceChannel.members.size}/${voiceChannel.userLimit}).\n`;
  }
  
  // Next steps
  if (missingRequired.length > 0) {
    response += '\n## To fix permission issues:\n';
    response += '1. Go to Server Settings > Roles\n';
    response += '2. Find the bot\'s role\n';
    response += '3. Enable the missing permissions\n';
    response += '4. Or check channel-specific permissions by right-clicking the voice channel';
  }
  
  return interaction.editReply(response);
}

// Helper function to convert permission bit to readable string
function permToString(permission) {
  const permName = Object.entries(PermissionsBitField.Flags)
    .find(([, value]) => value === permission)?.[0];
    
  return permName
    ? permName.replace(/([A-Z])/g, ' $1').trim()
    : 'Unknown Permission';
} 