import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior
} from '@discordjs/voice';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const soundsDir = path.join(__dirname, '../../../sounds');

// Create sounds directory if it doesn't exist
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Track voice connections
const connections = new Map();

// Get available sounds
function getSoundFiles() {
  if (!fs.existsSync(soundsDir)) return [];
  return fs.readdirSync(soundsDir)
    .filter(file => file.endsWith('.mp3'));
}

export const data = new SlashCommandBuilder()
  .setName('playsound')
  .setDescription('Play a built-in sound effect in your voice channel')
  .addStringOption(option => 
    option.setName('sound')
      .setDescription('The sound to play')
      .setRequired(true)
      .addChoices(
        { name: 'Airhorn', value: 'airhorn.mp3' },
        { name: 'Drum Roll', value: 'drumroll.mp3' },
        { name: 'Fail', value: 'fail.mp3' },
        { name: 'Success', value: 'success.mp3' },
        { name: 'Alert', value: 'alert.mp3' }
      )
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  // Get the voice channel the user is in
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.editReply('❌ You must be in a voice channel to use this command!');
  }
  
  // Check permissions
  const permissions = interaction.guild.members.me.permissionsIn(voiceChannel);
  if (!permissions.has(['ViewChannel', 'Connect', 'Speak'])) {
    return interaction.editReply('❌ I need permissions to view, connect, and speak in your voice channel!');
  }
  
  // Get the sound to play
  const soundName = interaction.options.getString('sound');
  const soundPath = path.join(soundsDir, soundName);
  
  // Check if we need to download default sounds
  if (!fs.existsSync(soundPath)) {
    await interaction.editReply('⏳ Setting up sound files for first use...');
    try {
      // Here we'd download the sound files, but for now just inform user
      return interaction.editReply('❌ Sound files are not yet available. Please contact the bot administrator to add sound files.');
    } catch (error) {
      console.error('Error setting up sound files:', error);
      return interaction.editReply('❌ Failed to set up sound files.');
    }
  }
  
  try {
    // Clean up existing connection
    if (connections.has(interaction.guildId)) {
      try {
        const { connection, player } = connections.get(interaction.guildId);
        connection.destroy();
        player.stop();
      } catch (e) {
        console.error('Error cleaning up:', e);
      }
      connections.delete(interaction.guildId);
    }
    
    // Create a connection to the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    
    // Create an audio player
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });
    
    // Create an audio resource from the sound file
    const resource = createAudioResource(fs.createReadStream(soundPath), {
      inlineVolume: true
    });
    resource.volume?.setVolume(0.5);
    
    // Subscribe the connection to the player
    connection.subscribe(player);
    
    // Track the connection
    connections.set(interaction.guildId, { connection, player });
    
    // Play the sound
    player.play(resource);
    
    // Handle player state changes
    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`Playing sound ${soundName} in guild ${interaction.guildId}`);
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      // Sound finished playing, clean up
      console.log(`Sound ${soundName} finished playing in guild ${interaction.guildId}`);
      connection.destroy();
      connections.delete(interaction.guildId);
    });
    
    player.on('error', error => {
      console.error('Player error:', error);
      connection.destroy();
      connections.delete(interaction.guildId);
    });
    
    // Let the user know the sound is playing
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🔊 Playing Sound')
      .setDescription(`Playing **${soundName.replace('.mp3', '')}** sound effect`)
      .addFields(
        { name: 'Channel', value: voiceChannel.name, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error playing sound:', error);
    return interaction.editReply(`❌ Error playing sound: ${error.message}`);
  }
} 