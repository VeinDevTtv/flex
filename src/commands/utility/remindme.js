import { SlashCommandBuilder } from 'discord.js';
import { parseTime, createReminder } from '../../utils/reminderManager.js';

export const data = new SlashCommandBuilder()
  .setName('remindme')
  .setDescription('Set a reminder that DMs you after a certain time')
  .addStringOption(option => 
    option.setName('time')
      .setDescription('Time until reminder (e.g., 10m, 1h, 30s, 2d)')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('message')
      .setDescription('What to remind you about')
      .setRequired(true));

export async function execute(interaction) {
  const timeStr = interaction.options.getString('time');
  const message = interaction.options.getString('message');
  
  try {
    // Check if user has DMs enabled
    const user = await interaction.client.users.fetch(interaction.user.id);
    try {
      await user.send('Testing DM access...');
    } catch (error) {
      await interaction.reply({ 
        content: '❌ I cannot send you DMs. Please enable DMs from server members in your privacy settings.',
        ephemeral: true 
      });
      return;
    }
    
    // Parse time string into milliseconds
    const delay = parseTime(timeStr);
    
    // Create a callback function that will DM the user when the reminder is due
    const callback = async (userId, reminderMessage) => {
      try {
        const user = await interaction.client.users.fetch(userId);
        await user.send(`⏰ **Reminder:** ${reminderMessage}`);
      } catch (error) {
        console.error(`Failed to send reminder to user ${userId}:`, error);
      }
    };
    
    // Create reminder
    createReminder(interaction.user.id, message, delay, callback);
    
    // Calculate the reminder time for the user
    const reminderDate = new Date(Date.now() + delay);
    const formattedTime = reminderDate.toLocaleString();
    
    await interaction.reply({ 
      content: `✅ I'll remind you about "${message}" at ${formattedTime}`,
      ephemeral: true 
    });
  } catch (error) {
    await interaction.reply({ 
      content: `❌ Error: ${error.message}`,
      ephemeral: true 
    });
  }
} 