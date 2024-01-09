module.exports = {
  DASHBOARD_MESSAGE_MAX_LIFETIME: 3600, // Time in seconds to send a new dashboard message
  PRESENCE_UPDATE_INTERVAL: 600, // Interval in seconds to update the presence
  VOICE_CHANNEL_UPDATE_COOLDOWN: 30, // Time in seconds to update the voice channel in database
  VOICE_CHANNEL_EMPTY_TIMEOUT: 180, // Time in seconds before leaving the voice channel when it is empty
  SUBINTERACTION_COLLECTOR_TIMEOUT: 120, // Time in seconds before collector ends
  LIBRARY_MAX_LENGTH: 20, // Max. number of items in library
  SONG_NAME_MAX_LENGTH_DISPLAY: 60, // Max. number of characters to display in song name
  QUEUE_MAX_LENGTH: 2000, // Max. number of songs in queue
  QUEUE_MAX_LENGTH_DISPLAY: 25, // Max. number of songs to display in queue
  DURATION_BAR_MAX_LENGTH_DISPLAY: 20, // Max. number of characters to display in duration bar
  MONGO_AUTO_INDEX: false, // Automatic index creation
  MONGO_MAX_POOL_SIZE: 10, // Max. number of open sockets
  MONGO_SERVER_SELECTION_TIMEOUT_MS: 5000, // Time in milliseconds to find a server to send an operation before failing
  MONGO_SOCKET_TIMEOUT_MS: 45000, // Time in milliseconds before killing a socket due to inactivity
  MONGO_FAMILY: 4, // Internet protocol version (4: IPv4, 6: IPv6, 0: both)
  DISTUBE_LEAVE_ON_FINISH: false, // Leave the voice channel when queue ends
  DISTUBE_LEAVE_ON_STOP: false, // Leave the voice channel when queue is stopped
  DISTUBE_LEAVE_ON_EMPTY: false, // Leave the voice channel when it is empty
  DISTUBE_SEARCH_MAX_RESULTS: 20, // Max. number of search results
  DISTUBE_NSFW: true, // Play age-restricted content
  DISTUBE_SAVE_PREVIOUS_SONGS: false, // Save previous songs in queue
  DISTUBE_CUSTOM_FILTERS: { "8d": "apulsator=hz=0.08", "purebass": "bass=g=20,dynaudnorm=f=200,asubboost", "subboost": "asubboost", "fast": "atempo=1.3", "vibrato": "vibrato=f=6.5", "pulsator": "apulsator=hz=1" } // Custom ffmpeg filters
}