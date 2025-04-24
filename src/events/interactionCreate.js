import { Events } from 'discord.js';
import { checkCooldown } from '../utils/cooldownManager.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  console.log(`[SlashCommand] ${interaction.commandName} used by ${interaction.user.tag}`);

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  // Check cooldown
  const cooldown = checkCooldown(
    interaction.user.id,
    interaction.commandName,
    300000, // 5 minutes cooldown
    2,      // Max 2 uses
    10000   // Within 10 seconds
  );

  if (cooldown.onCooldown) {
    await interaction.reply({ 
      content: cooldown.message,
      ephemeral: true 
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    
    // If the interaction was already replied to, follow up with an error message
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      });
    } else {
      // Otherwise reply with an error message
      await interaction.reply({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      });
    }
  }
} 