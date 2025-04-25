import { Events } from 'discord.js';
import { checkCooldown } from '../utils/cooldownManager.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  console.log(`[SlashCommand] ${interaction.commandName} used by ${interaction.user.tag}`);
  console.log('Command options:', interaction.options.data);

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
    console.log(`[Cooldown] User ${interaction.user.tag} is on cooldown for ${interaction.commandName}`);
    try {
      await interaction.reply({ 
        content: cooldown.message,
        ephemeral: true 
      });
    } catch (cooldownError) {
      console.error('[Cooldown Error] Failed to reply with cooldown message:', cooldownError);
    }
    return;
  }

  try {
    console.log(`[Executing] ${interaction.commandName} for ${interaction.user.tag}`);
    await command.execute(interaction);
    console.log(`[Success] ${interaction.commandName} executed successfully`);
  } catch (error) {
    console.error(`[Error] Error executing ${interaction.commandName}:`, error);
    
    try {
      // If the interaction was already replied to or deferred, follow up with an error message
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        }).catch(followupError => {
          console.error('[Error Handling] Failed to send followup message:', followupError);
        });
      } else {
        // Otherwise reply with an error message
        await interaction.reply({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        }).catch(replyError => {
          console.error('[Error Handling] Failed to send reply message:', replyError);
        });
      }
    } catch (errorHandlingError) {
      // Last resort error handling to prevent crashing
      console.error('[Critical] Failed to handle command error properly:', errorHandlingError);
    }
  }
} 