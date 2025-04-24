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
    // Parse time string into milliseconds
    const delay = parseTime(timeStr);
    
    // Create a callback function that will DM the user when the reminder is due
    const callback = async (userId, reminderMessage) => {
      const user = await interaction.client.users.fetch(userId);
      user.send(`⏰ **Reminder:** ${reminderMessage}`);
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