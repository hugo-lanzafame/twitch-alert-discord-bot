require('dotenv').config();

const CONFIG = {
    // Global
    discord: {
        token: process.env.DISCORD_TOKEN,
    },
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        username: process.env.TWITCH_USERNAME?.toLowerCase(),
        apiBaseUrl: process.env.TWITCH_API_BASE_URL,
        authUrl: process.env.TWITCH_AUTH_URL,
    },
    apiSettings: {
        maxRetries: parseInt(process.env.API_MAX_RETRIES || '3', 10),
        retryDelay: parseInt(process.env.API_RETRY_DELAY || '2000', 10),
        requestTimeout: parseInt(process.env.API_REQUEST_TIMEOUT || '10000', 10),
    },

    // Features
    features: {
        liveNotification: {
            // Feature is enabled IF the channelId is provided
            isEnabled: !!process.env.LIVE_NOTIFICATION_CHANNEL_ID,
            channelId: process.env.LIVE_NOTIFICATION_CHANNEL_ID,
            checkInterval: parseInt(process.env.LIVE_NOTIFICATION_CHECK_INTERVAL || '60000', 10),
        },
        topClips: {
            // Feature is enabled IF the channelId is provided
            isEnabled: !!process.env.TOP_CLIPS_CHANNEL_ID,
            channelId: process.env.TOP_CLIPS_CHANNEL_ID,
            schedule: process.env.TOP_CLIPS_SCHEDULE || '0 20 * * *',
            count: parseInt(process.env.TOP_CLIP_COUNT || '5', 10),
        },
        crafty: {
            // Feature is enabled IF the channelId is provided
            isEnabled: !!process.env.CRAFTY_API_TOKEN,
            apiToken: process.env.CRAFTY_API_TOKEN,
            apiBaseUrl: process.env.CRAFTY_API_BASE_URL,
            minecraftServerId: process.env.CRAFTY_MINECRAFT_SERVER_ID,
            channelId: process.env.CRAFTY_CHANNEL_ID,
            roleId: process.env.CRAFTY_ROLE_ID,
        }
    },
};

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
function validateConfig() {
    const requiredKeys = [
        'DISCORD_TOKEN',
        'TWITCH_CLIENT_ID',
        'TWITCH_CLIENT_SECRET',
        'TWITCH_USERNAME',
        'TWITCH_API_BASE_URL',
        'TWITCH_AUTH_URL',
        'API_MAX_RETRIES',
        'API_RETRY_DELAY',
        'API_REQUEST_TIMEOUT',
    ];

    if (CONFIG.features.liveNotification.isEnabled) {
        requiredKeys.push(
            'LIVE_NOTIFICATION_CHANNEL_ID',
            'LIVE_NOTIFICATION_CHECK_INTERVAL'
        );
    }

    if (CONFIG.features.topClips.isEnabled) {
        requiredKeys.push(
            'TOP_CLIPS_CHANNEL_ID',
            'TOP_CLIPS_SCHEDULE',
            'TOP_CLIP_COUNT'
        );
    }

    if (CONFIG.features.crafty.isEnabled) {
        requiredKeys.push(
            'CRAFTY_API_TOKEN',
            'CRAFTY_API_BASE_URL',
            'CRAFTY_MINECRAFT_SERVER_ID',
        );
    }

    const missing = requiredKeys.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

module.exports = { CONFIG, validateConfig };