import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Installing Discord music bot dependencies...');

try {
  // Check if ffmpeg is already installed
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('✅ FFmpeg is already installed.');
  } catch (error) {
    console.log('⚠️ FFmpeg not found. Installing ffmpeg-static...');
    execSync('npm install ffmpeg-static --save', { stdio: 'inherit' });
  }

  // Install the essential voice dependencies
  console.log('Installing essential voice dependencies...');
  
  const dependencies = [
    '@discordjs/voice@0.16.0',
    '@discordjs/opus@0.9.0',
    'sodium-native@4.0.4',
    'libsodium-wrappers@0.7.13',
    'opusscript@0.0.8',
    'play-dl@1.9.7',
    'ytdl-core@4.11.5',
    'tweetnacl@1.0.3'
  ];
  
  execSync(`npm install ${dependencies.join(' ')} --save`, { stdio: 'inherit' });
  
  // Check if we need to install native dependencies on Windows
  if (process.platform === 'win32') {
    console.log('Installing Windows-specific dependencies...');
    try {
      execSync('npm install node-gyp -g', { stdio: 'inherit' });
      execSync('npm install --global --production windows-build-tools', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Could not install Windows build tools. You may need to run this as administrator.');
      console.log('If you have trouble with audio playback, try running:');
      console.log('npm install --global --production windows-build-tools');
    }
  }
  
  // Create a .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env file...');
    const envContent = `# Discord Bot Configuration
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file. Please edit it with your bot credentials.');
  }
  
  console.log('\n✅ All dependencies installed successfully!');
  console.log('\nNext steps:');
  console.log('1. Make sure your .env file has your bot token, client ID, and guild ID');
  console.log('2. Deploy commands with: npm run deploy');
  console.log('3. Start the bot with: npm start');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
} 