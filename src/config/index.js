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
    },
    api: {
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

    const missing = requiredKeys.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

module.exports = { CONFIG, validateConfig };