const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { CONFIG } = require('../config');
const Logger = require('../utils/logger');

/**
 * Service to interact with Discord API
 */
class DiscordService {
    constructor() {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });
        
        this.isReady = false;
        this.setupEventHandlers();
    }

    /**
     * Setup Discord client event handlers
     */
    setupEventHandlers() {
        this.client.once('clientReady', () => {
            this.isReady = true;
            Logger.success(`Discord bot connected as ${this.client.user.tag}`);
        });

        this.client.on('error', (error) => {
            Logger.error('Discord client error:', error.message);
        });
    }

    /**
     * Login to Discord
     * @returns {Promise<void>}
     */
    async login() {
        try {
            await this.client.login(CONFIG.discord.token);
        } catch (error) {
            Logger.error('Failed to login to Discord:', error.message);
            throw error;
        }
    }

    /**
     * Destroy Discord client
     * @returns {Promise<void>}
     */
    async destroy() {
        if (this.client) {
            await this.client.destroy();
            Logger.info('Discord client destroyed');
        }
    }

    /**
     * Wait until the bot is ready
     * @param {number} timeout - Maximum wait time in ms
     * @returns {Promise<void>}
     */
    async waitUntilReady(timeout = 10000) {
        const startTime = Date.now();
        
        while (!this.isReady) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Discord client ready timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * Send a live notification to Discord channel
     * @param {Object} streamData - Twitch stream data
     * @returns {Promise<void>}
     */
    async sendLiveNotification(streamData) {
        try {
            if (!this.isReady) {
                throw new Error('Discord client is not ready');
            }

            const channel = await this.client.channels.fetch(CONFIG.discord.channelId);
            
            if (!channel) {
                throw new Error(`Channel ${CONFIG.discord.channelId} not found`);
            }

            if (!channel.isTextBased()) {
                throw new Error('Target channel is not a text channel');
            }

            const embed = this.buildLiveEmbed(streamData);

            await channel.send({
                content: '@everyone The stream has started!',
                embeds: [embed]
            });

            Logger.success('Live notification sent successfully');
        } catch (error) {
            Logger.error('Failed to send live notification:', error.message);
            throw error;
        }
    }

    /**
     * Build Discord embed for live notification
     * @param {Object} streamData - Twitch stream data
     * @returns {EmbedBuilder} Discord embed
     */
    buildLiveEmbed(streamData) {
        const thumbnailUrl = streamData.thumbnail_url
            .replace('{width}', '1920')
            .replace('{height}', '1080') + `?t=${Date.now()}`; // Cache busting

        return new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle(`🔴 ${streamData.user_name} is LIVE!`)
            .setDescription(streamData.title || 'No description')
            .setURL(`https://twitch.tv/${CONFIG.twitch.username}`)
            .addFields(
                { 
                    name: '🎮 Game', 
                    value: streamData.game_name || 'Not specified', 
                    inline: true 
                },
                { 
                    name: '👥 Viewers', 
                    value: streamData.viewer_count?.toString() || '0', 
                    inline: true 
                }
            )
            .setImage(thumbnailUrl)
            .setTimestamp()
            .setFooter({ text: 'Twitch Live Notification' });
    }
}

module.exports = DiscordService;