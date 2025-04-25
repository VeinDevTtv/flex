import { 
  createAudioPlayer, 
  createAudioResource, 
  joinVoiceChannel, 
  AudioPlayerStatus, 
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection
} from '@discordjs/voice';
import play from 'play-dl';
import ytdl from 'ytdl-core';

// Store guild queues globally
const queues = new Map();

/**
 * Get or create a music queue for a guild
 * @param {string} guildId - The guild ID
 * @returns {Object} The guild queue object
 */
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      currentSong: null,
      player: createAudioPlayer(),
      textChannel: null,
      connection: null,
      playing: false
    });
  }
  return queues.get(guildId);
}

/**
 * Join a voice channel
 * @param {Object} interaction - The Discord interaction
 * @returns {Promise<Object>} The voice connection or null if failed
 */
async function joinVoiceChannelForUser(interaction) {
  const voiceChannel = interaction.member.voice.channel;
  
  if (!voiceChannel) {
    await interaction.reply({ 
      content: '❌ You need to be in a voice channel to use this command!', 
      ephemeral: true 
    });
    return null;
  }
  
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    
    // Try to connect and wait for it to be ready
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (error) {
    console.error('Error connecting to voice channel:', error);
    await interaction.followUp({
      content: '❌ Error connecting to voice channel!',
      ephemeral: true
    });
    return null;
  }
}

/**
 * Add a song to the queue
 * @param {Object} interaction - The Discord interaction
 * @param {Object} song - The song to add
 * @param {boolean} playSong - Whether to start playing the song
 */
async function addSong(interaction, song, playSong = false) {
  const queue = getQueue(interaction.guild.id);
  
  // Store the text channel to send notifications
  if (!queue.textChannel) {
    queue.textChannel = interaction.channel;
  }
  
  // Add the song to the queue
  queue.songs.push(song);
  
  if (playSong && (!queue.playing || queue.songs.length === 1)) {
    queue.playing = true;
    return playNextSong(interaction.guild.id);
  }
  
  return queue;
}

/**
 * Play the next song in the queue
 * @param {string} guildId - The guild ID
 */
async function playNextSong(guildId) {
  const queue = getQueue(guildId);
  
  if (queue.songs.length === 0) {
    queue.playing = false;
    queue.currentSong = null;
    
    if (queue.textChannel) {
      queue.textChannel.send('✅ Queue finished! Use `/play` to add more songs.');
    }
    
    // Disconnect after 30 seconds of inactivity
    setTimeout(() => {
      const connection = getVoiceConnection(guildId);
      if (connection && !queue.playing) {
        connection.destroy();
        
        if (queue.textChannel) {
          queue.textChannel.send('👋 Disconnected due to inactivity.');
        }
      }
    }, 30000);
    
    return;
  }
  
  // Get the next song
  const song = queue.songs.shift();
  queue.currentSong = song;
  
  try {
    if (queue.textChannel) {
      queue.textChannel.send(`⏳ Preparing to play: **${song.title}**`);
    }
    
    // Make sure we're connected to a voice channel
    if (!queue.connection) {
      queue.connection = getVoiceConnection(guildId);
      if (!queue.connection) {
        if (queue.textChannel) {
          queue.textChannel.send(`❌ Voice connection lost. Please use the command again.`);
        }
        queue.playing = false;
        return;
      }
    }
    
    console.log(`Attempting to stream: ${song.url}`);
    
    // Basic stream options
    const ytdl_options = { 
      quality: 'highestaudio',
      filter: 'audioonly',
      highWaterMark: 1024 * 1024 * 64, // 64MB buffer
      dlChunkSize: 0, // Request the whole file at once
      requestOptions: {
        headers: {
          // Add a user agent to avoid some restrictions
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      }
    };
    
    // Stream using play-dl for better performance
    let stream_data = await play.stream(song.url, {
      discordPlayerCompatibility: true,
      quality: 2, // high quality (0-2)
      seek: 0,
      opusEncoded: true, // Request opus encoding
      ffmpegOptions: {
        args: ['-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '5']
      }
    }).catch(error => {
      console.error('Error streaming song:', error);
      if (queue.textChannel) {
        queue.textChannel.send(`❌ Error streaming: ${error.message}`);
      }
      return null;
    });
    
    // If we couldn't get stream data, try a fallback method
    if (!stream_data) {
      if (queue.textChannel) {
        queue.textChannel.send(`⚠️ Trying fallback method...`);
      }
      
      // Use an alternative streaming method as fallback
      try {
        const alt_stream = await play.stream(song.url, {
          seek: 0,
          quality: 1, // Try a different quality
          discordPlayerCompatibility: true
        });
        
        if (!alt_stream) {
          throw new Error("Fallback streaming failed");
        }
        
        stream_data = alt_stream;
        console.log('Using fallback stream method');
      } catch (fallbackError) {
        console.error('Fallback streaming failed:', fallbackError);
        return playNextSong(guildId); // Skip to next song
      }
    }
    
    if (queue.textChannel) {
      queue.textChannel.send(`🔊 Creating audio resource...`);
    }
    
    // Create audio resource from the stream
    const resource = createAudioResource(stream_data.stream, {
      inputType: stream_data.type,
      inlineVolume: true,
      metadata: {
        title: song.title,
        url: song.url
      }
    });
    
    // Set volume to 80%
    if (resource.volume) {
      resource.volume.setVolume(0.8);
    }
    
    // Remove previous listeners to avoid duplicates
    queue.player.removeAllListeners();
    
    // Add new event listeners
    queue.player.on(AudioPlayerStatus.Playing, () => {
      if (queue.textChannel) {
        queue.textChannel.send(`▶️ Audio playback started!`);
      }
      console.log(`Now playing: ${song.title}`);
    });
    
    queue.player.on(AudioPlayerStatus.Idle, () => {
      console.log(`Finished playing: ${song.title}`);
      playNextSong(guildId);
    });
    
    queue.player.on('error', error => {
      console.error('Error playing song:', error);
      if (queue.textChannel) {
        queue.textChannel.send(`❌ Error playing song: ${error.message}`);
      }
      playNextSong(guildId);
    });
    
    // Update connection status if necessary
    queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(queue.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(queue.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        queue.connection.destroy();
        queue.playing = false;
      }
    });
    
    // Play the song
    queue.player.play(resource);
    
    // Make sure we're subscribed to the player
    const subscription = queue.connection.subscribe(queue.player);
    if (subscription) {
      if (queue.textChannel) {
        queue.textChannel.send(`🎵 Now playing: **${song.title}**`);
      }
    } else {
      if (queue.textChannel) {
        queue.textChannel.send(`❌ Failed to subscribe to audio player!`);
      }
      queue.connection.destroy();
      queue.playing = false;
    }
  } catch (error) {
    console.error('Error playing song:', error);
    if (queue.textChannel) {
      queue.textChannel.send(`❌ Error playing song: ${error.message}`);
    }
    
    // Try to play the next song
    playNextSong(guildId);
  }
}

/**
 * Skip the current song
 * @param {string} guildId - The guild ID
 * @returns {boolean} Whether the skip was successful
 */
function skipSong(guildId) {
  const queue = getQueue(guildId);
  
  if (!queue.playing || !queue.currentSong) {
    return false;
  }
  
  // Stop the current song, triggering the 'finish' event
  queue.player.stop();
  return true;
}

/**
 * Stop playing and clear the queue
 * @param {string} guildId - The guild ID
 * @returns {boolean} Whether the stop was successful
 */
function stopPlaying(guildId) {
  const queue = getQueue(guildId);
  const connection = getVoiceConnection(guildId);
  
  if (!connection) {
    return false;
  }
  
  // Clear the queue and stop playing
  queue.songs = [];
  queue.playing = false;
  queue.currentSong = null;
  queue.player.stop();
  connection.destroy();
  
  return true;
}

/**
 * Get current queue information
 * @param {string} guildId - The guild ID
 * @returns {Object} The queue information
 */
function getQueueInfo(guildId) {
  const queue = getQueue(guildId);
  
  return {
    currentSong: queue.currentSong,
    songs: queue.songs,
    isPlaying: queue.playing
  };
}

export {
  getQueue,
  joinVoiceChannelForUser,
  addSong,
  playNextSong,
  skipSong,
  stopPlaying,
  getQueueInfo
}; 