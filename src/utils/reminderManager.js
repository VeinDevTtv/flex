import { reminderDb } from './database.js';

// Store active reminders in memory
const activeReminders = new Map();

/**
 * Parse time string into milliseconds
 * @param {string} timeStr - Time string (e.g., "10m", "1h", "30s")
 * @returns {number} Time in milliseconds
 */
export function parseTime(timeStr) {
  const regex = /^(\d+)([smhd])$/;
  const match = timeStr.match(regex);
  
  if (!match) {
    throw new Error('Invalid time format. Use format like "10m", "1h", "30s", "2d"');
  }
  
  const [, amount, unit] = match;
  const value = parseInt(amount, 10);
  
  switch (unit) {
    case 's': return value * 1000;         // seconds
    case 'm': return value * 60 * 1000;    // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    default: throw new Error('Invalid time unit');
  }
}

/**
 * Create a new reminder
 * @param {string} userId - Discord user ID
 * @param {string} message - Reminder message
 * @param {number} delay - Delay in milliseconds
 * @param {Function} callback - Function to call when reminder is due
 * @returns {string} Reminder ID
 */
export function createReminder(userId, message, delay, callback) {
  const reminderId = Date.now().toString();
  const dueTime = Date.now() + delay;
  
  // Save to database
  const reminder = {
    id: reminderId,
    userId,
    message,
    timestamp: Date.now(),
    dueTime
  };
  reminderDb.save(reminder);
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    callback(userId, message);
    activeReminders.delete(reminderId);
    reminderDb.delete(reminderId);
  }, delay);
  
  activeReminders.set(reminderId, {
    ...reminder,
    timeoutId
  });
  
  return reminderId;
}

/**
 * Cancel a reminder
 * @param {string} reminderId - ID of the reminder to cancel
 * @returns {boolean} Whether the reminder was successfully cancelled
 */
export function cancelReminder(reminderId) {
  const reminder = activeReminders.get(reminderId);
  
  if (!reminder) {
    return false;
  }
  
  clearTimeout(reminder.timeoutId);
  activeReminders.delete(reminderId);
  reminderDb.delete(reminderId);
  return true;
}

/**
 * Get all active reminders for a user
 * @param {string} userId - Discord user ID
 * @returns {Array} Array of active reminders
 */
export function getUserReminders(userId) {
  return reminderDb.getByUserId(userId);
}

/**
 * Initialize reminders from database on bot start
 * @param {Function} callback - Function to call when reminder is due
 */
export function initializeReminders(callback) {
  const reminders = reminderDb.getAll();
  const now = Date.now();
  
  for (const reminder of reminders) {
    const timeUntilDue = reminder.dueTime - now;
    
    if (timeUntilDue <= 0) {
      // Reminder is already due, trigger it immediately
      callback(reminder.userId, reminder.message);
      reminderDb.delete(reminder.id);
    } else {
      // Set timeout for future reminder
      const timeoutId = setTimeout(() => {
        callback(reminder.userId, reminder.message);
        activeReminders.delete(reminder.id);
        reminderDb.delete(reminder.id);
      }, timeUntilDue);
      
      activeReminders.set(reminder.id, {
        ...reminder,
        timeoutId
      });
    }
  }
} 