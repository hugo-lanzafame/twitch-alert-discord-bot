require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const CONFIG = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITCH_USERNAME: process.env.TWITCH_USERNAME,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    CHECK_INTERVAL: process.env.CHECK_INTERVAL
};

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let isLive = false;
let twitchAccessToken = null;

// Get Twitch Access Token
async function getTwitchAccessToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: CONFIG.TWITCH_CLIENT_ID,
                client_secret: CONFIG.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Twitch access token:', error);
        return null;
    }
}

// Check if the stream is live
async function checkStreamStatus() {
    try {
        if (!twitchAccessToken) {
            twitchAccessToken = await getTwitchAccessToken();
        }

        const response = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: {
                'Client-ID': CONFIG.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${twitchAccessToken}`
            },
            params: {
                user_login: CONFIG.TWITCH_USERNAME
            }
        });

        const streamData = response.data.data[0];
        
        if (streamData && !isLive) {
            // The stream has just started
            isLive = true;
            await sendLiveNotification(streamData);
        } else if (!streamData && isLive) {
            // The stream has ended
            isLive = false;
            console.log('Stream has ended');
        }
    } catch (error) {
        console.error('Error checking stream status:', error);
        // Reset the token on authentication error
        if (error.response?.status === 401) {
            twitchAccessToken = null;
        }
    }
}

// Send Discord notification
async function sendLiveNotification(streamData) {
    try {
        const channel = await client.channels.fetch(CONFIG.DISCORD_CHANNEL_ID);
        
        const embed = new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle(`🔴 ${streamData.user_name} is LIVE!`)
            .setDescription(streamData.title)
            .setURL(`https://twitch.tv/${CONFIG.TWITCH_USERNAME}`)
            .addFields(
                { name: '🎮 Game', value: streamData.game_name || 'Unknown', inline: true },
            )
            .setImage(streamData.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'))
            .setTimestamp()
            .setFooter({ text: 'Twitch Live Notification' });

        await channel.send({
            content: '@everyone Le stream a commencé !',
            embeds: [embed]
        });

        console.log('Notification sent successfully!');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Start the bot
client.once('clientReady', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    console.log('Surveillance du stream en cours...');
    
    // Check stream status at regular intervals
    setInterval(checkStreamStatus, CONFIG.CHECK_INTERVAL);
    checkStreamStatus(); // First check immediately
});

client.login(CONFIG.DISCORD_TOKEN);