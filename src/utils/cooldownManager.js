// Store cooldowns in memory
const cooldowns = new Map();

/**
 * Check if a user is on cooldown for a command
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Name of the command
 * @param {number} cooldownTime - Cooldown time in milliseconds
 * @param {number} maxUses - Maximum uses before cooldown
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Object} Cooldown status
 */
export function checkCooldown(userId, commandName, cooldownTime = 300000, maxUses = 2, timeWindow = 10000) {
  const now = Date.now();
  const key = `${userId}-${commandName}`;
  
  if (!cooldowns.has(key)) {
    cooldowns.set(key, {
      uses: 1,
      lastUse: now,
      cooldownUntil: null
    });
    return { onCooldown: false };
  }
  
  const userCooldown = cooldowns.get(key);
  
  // If user is on cooldown
  if (userCooldown.cooldownUntil && now < userCooldown.cooldownUntil) {
    const remainingTime = Math.ceil((userCooldown.cooldownUntil - now) / 1000);
    return { 
      onCooldown: true, 
      remainingTime,
      message: `⏰ You're on cooldown for ${remainingTime} seconds.`
    };
  }
  
  // Check if user has exceeded max uses in time window
  if (now - userCooldown.lastUse < timeWindow) {
    userCooldown.uses++;
    
    if (userCooldown.uses >= maxUses) {
      userCooldown.cooldownUntil = now + cooldownTime;
      return { 
        onCooldown: true, 
        remainingTime: Math.ceil(cooldownTime / 1000),
        message: `⚠️ Command spam detected! You're on cooldown for ${Math.ceil(cooldownTime / 1000)} seconds.`
      };
    }
  } else {
    // Reset uses if time window has passed
    userCooldown.uses = 1;
  }
  
  userCooldown.lastUse = now;
  return { onCooldown: false };
}

/**
 * Clear all cooldowns for a user
 * @param {string} userId - Discord user ID
 */
export function clearUserCooldowns(userId) {
  for (const [key] of cooldowns) {
    if (key.startsWith(`${userId}-`)) {
      cooldowns.delete(key);
    }
  }
}

/**
 * Clear all cooldowns
 */
export function clearAllCooldowns() {
  cooldowns.clear();
} 