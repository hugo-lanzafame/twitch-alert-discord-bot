const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { CONFIG } = require('../config');
const Logger = require('../utils/logger');

/**
 * Service to interact with Discord API
 */
class DiscordService {
    /**
     * @param {import('./crafty.service')} craftyService
     */
    constructor(craftyService) {
        this.craftyService = craftyService;

        this.discordToken = CONFIG.discord.token;
        this.twitchUsername = CONFIG.twitch.username;
        this.liveNotificationChannelId = CONFIG.features.liveNotification.channelId;
        this.topClipsChannelId = CONFIG.features.topClips.channelId;
        this.craftyIsEnabled = CONFIG.features.crafty.isEnabled;
        this.craftyRoleId = CONFIG.features.crafty.roleId;

        this.client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });

        this.isReady = false;
        this.commands = new Map();
        this.setupEventHandlers();
    }

    /**
     * Setup Discord client event handlers
     */
    setupEventHandlers() {
        this.client.once('clientReady', async () => {
            this.isReady = true;
            Logger.success(`Discord bot connected as ${this.client.user.tag}`);
            await this.registerSlashCommands();
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) {
                return;
            }

            await this.handleInteraction(interaction);
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
            await this.client.login(this.discordToken);
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
     * Register commands dynamically
     */
    async registerSlashCommands() {
        const commandList = [];

        // Feature: Crafty
        if (this.craftyIsEnabled) {
            commandList.push(
                new SlashCommandBuilder().setName('mc-start').setDescription('Start Minecraft server'),
                new SlashCommandBuilder().setName('mc-stop').setDescription('Stop Minecraft server'),
                new SlashCommandBuilder().setName('mc-status').setDescription('Check Minecraft server status')
            );
        }

        const rest = new REST({ version: '10' }).setToken(this.discordToken);

        try {
            Logger.info('[DISCORD] Refreshing slash commands...');
            await rest.put(
                Routes.applicationCommands(this.client.user.id),
                { body: commandList.map(c => c.toJSON()) },
            );
            Logger.success('[DISCORD] Slash commands registered.');
        } catch (error) {
            Logger.error('[DISCORD] Failed to register commands:', error);
        }
    }

    /**
     * Interaction dispatcher
     */
    async handleInteraction(interaction) {
        const { commandName } = interaction;

        // Feature: Crafty
        if (commandName.startsWith('mc-')) {
            if (!this.craftyIsEnabled) {
                return interaction.reply({ content: 'This feature is disabled.', ephemeral: true });
            }

            if (this.craftyRoleId && !interaction.member.roles.cache.has(this.craftyRoleId)) {
                return interaction.reply({ content: 'You don\'t have the right role for this.', ephemeral: true });
            }

            return this.handleCraftyCommand(interaction);
        }
    }

    /**
     * Crafty command handler
     */
    async handleCraftyCommand(interaction) {
        const { commandName } = interaction;
        await interaction.deferReply();

        try {
            switch (commandName) {
                case 'mc-start':
                    await this.craftyService.startMinecraftServer();
                    await interaction.editReply('Minecraft server starting up...');
                    break;
                case 'mc-stop':
                    await this.craftyService.stopMinecraftServer();
                    await interaction.editReply('Minecraft server shutdown...');
                    break;
                case 'mc-restart':
                    await this.craftyService.restartMinecraftServer();
                    await interaction.editReply('Minecraft server restarting...');
                    break;
                case 'mc-status':
                    const stats = await this.craftyService.getMinecraftServerInfo();
                    await interaction.editReply({ embeds: [this.buildMinecraftStatusEmbed(stats)] });
                    break;
            }
        } catch (error) {
            Logger.error(`[CRAFTY] Error: ${error.message}`);
            await interaction.editReply('Technical error with the Minecraft server.');
        }
    }

    /**
     * Embed builder for minecraft server status
     */
    buildMinecraftStatusEmbed(stats) {
        return new EmbedBuilder()
            .setColor(stats.running ? '#2ecc71' : '#e74c3c')
            .setTitle('Minecraft server')
            .addFields(
                { name: 'Statut', value: stats.running ? 'Online' : 'Offline', inline: true },
                { name: 'Players', value: `${stats.online_players || 0}/${stats.max_players || 0}`, inline: true }
            )
            .setTimestamp();
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

            const channel = await this.client.channels.fetch(this.liveNotificationChannelId);

            if (!channel) {
                throw new Error(`Live channel ${this.liveNotificationChannelId} not found`);
            }

            if (!channel.isTextBased()) {
                throw new Error('Target channel is not a text channel');
            }

            const embed = this.buildLiveNotificationEmbed(streamData);

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
    buildLiveNotificationEmbed(streamData) {
        const thumbnailUrl = streamData.thumbnail_url
            .replace('{width}', '1920')
            .replace('{height}', '1080') + `?t=${Date.now()}`;

        return new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle(`🔴 ${streamData.user_name} is LIVE!`)
            .setDescription(streamData.title || 'No description')
            .setURL(`https://twitch.tv/${this.twitchUsername}`)
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

    /**
     * Send the top clips notification to Discord channel
     * @param {Object[]} clips - List of clips
     * @returns {Promise<void>}
     */
    async sendTopClips(clips) {
        try {
            if (!this.isReady) {
                throw new Error('Discord client is not ready');
            }

            const channel = await this.client.channels.fetch(this.topClipsChannelId);

            if (!channel) {
                throw new Error(`Clips channel ${this.topClipsChannelId} not found`);
            }

            if (!channel.isTextBased()) {
                throw new Error('Clips channel is not a text channel');
            }

            const embed = this.buildTopClipsEmbed(clips);

            await channel.send({
                content: `Here are the Top ${clips.length} clips!`,
                embeds: [embed]
            });

            Logger.success('Clips notification sent successfully');
        } catch (error) {
            Logger.error('Failed to send clips notification. Full error details:', error);

            throw error;
        }
    }

    /**
     * Build Discord embed for top clips notification
     * @param {Object[]} clips - List of clips
     * @returns {EmbedBuilder} Discord embed
     */
    buildTopClipsEmbed(clips) {
        const fields = [];

        clips.forEach((clip, index) => {
            const rank = index + 1;
            const rankPrefixes = ['🥇', '🥈', '🥉'];
            const prefix = rankPrefixes[index] || `N°${rank}`;

            fields.push({
                name: `${prefix}. ${clip.title || 'Not specified'}`,
                value: `by ${clip.creator_name} with **${clip.view_count}** views\n[**Click here to watch!**](${clip.url}) `,
                inline: false
            });
        });

        const description = `We've got the Top **${clips.length}** clips from **${this.twitchUsername}** over the last 24 hours! Check out the best moments below.`;
        const thumbnailUrl = clips[0]?.thumbnail_url.replace('-preview-480x272.jpg', '.jpg') || '';

        return new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle(`🟣 Top clips are READY!`)
            .setURL(`https://twitch.tv/${this.twitchUsername}/videos?filter=clips&range=24hr`)
            .addFields(fields)
            .setDescription(description)
            .setImage(thumbnailUrl)
            .setTimestamp()
            .setFooter({ text: 'Twitch Top Clips' });
    }
}

module.exports = DiscordService;