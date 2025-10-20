require('dotenv').config();

const CONFIG = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        channelId: process.env.DISCORD_CHANNEL_ID
    },
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        username: process.env.TWITCH_USERNAME
    },
    monitor: {
        checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000,
        maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
        retryDelay: parseInt(process.env.RETRY_DELAY) || 2000,
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000
    }
};

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
function validateConfig() {
    const required = [
        ['DISCORD_TOKEN', CONFIG.discord.token],
        ['DISCORD_CHANNEL_ID', CONFIG.discord.channelId],
        ['TWITCH_CLIENT_ID', CONFIG.twitch.clientId],
        ['TWITCH_CLIENT_SECRET', CONFIG.twitch.clientSecret],
        ['TWITCH_USERNAME', CONFIG.twitch.username]
    ];
    
    const missing = required
        .filter(([_, value]) => !value)
        .map(([key]) => key);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

module.exports = { CONFIG, validateConfig };