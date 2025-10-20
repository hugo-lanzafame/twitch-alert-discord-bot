const { CONFIG, validateConfig } = require('./config');
const TwitchService = require('./services/twitch.service');
const DiscordService = require('./services/discord.service');
const Logger = require('./utils/logger');

/**
 * Main stream monitor class
 */
class StreamMonitor {
    constructor() {
        this.twitchService = new TwitchService();
        this.discordService = new DiscordService();
        this.isLive = false;
        this.checkInProgress = false;
        this.checkInterval = null;
    }

    /**
     * Initialize and start the monitor
     */
    async start() {
        try {
            // Validate configuration
            validateConfig();
            Logger.success('Configuration validated');

            // Setup graceful shutdown
            this.setupGracefulShutdown();

            // Connect to Discord
            await this.discordService.login();
            await this.discordService.waitUntilReady();

            Logger.info(
                `Monitoring ${CONFIG.twitch.username} every ${CONFIG.monitor.checkInterval}ms`
            );

            // Start monitoring
            this.startMonitoring();

        } catch (error) {
            Logger.error('Fatal error during startup:', error.message);
            process.exit(1);
        }
    }

    /**
     * Start the monitoring loop
     */
    startMonitoring() {
        // First check immediately
        this.checkStreamStatus();
        
        // Schedule regular checks
        this.checkInterval = setInterval(() => {
            this.checkStreamStatus();
        }, CONFIG.monitor.checkInterval);
    }

    /**
     * Stop the monitoring loop
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            Logger.info('Monitoring stopped');
        }
    }

    /**
     * Check the current stream status
     */
    async checkStreamStatus() {
        // Prevent concurrent checks
        if (this.checkInProgress) {
            Logger.debug('Check already in progress, skipping...');
            return;
        }

        this.checkInProgress = true;

        try {
            const streamData = await this.twitchService.getStreamData(CONFIG.twitch.username);
            await this.handleStreamStatusChange(streamData);

        } catch (error) {
            Logger.error('Error checking stream status:', error.message);
        } finally {
            this.checkInProgress = false;
        }
    }

    /**
     * Handle stream status changes
     * @param {Object|null} streamData - Current stream data
     */
    async handleStreamStatusChange(streamData) {
        const wasLive = this.isLive;
        const isNowLive = !!streamData;

        if (isNowLive && !wasLive) {
            // Stream just started
            this.isLive = true;
            Logger.info(`${streamData.user_name} is now LIVE!`);
            
            try {
                await this.discordService.sendLiveNotification(streamData);
            } catch (error) {
                Logger.error('Failed to send notification:', error.message);
            }
            
        } else if (!isNowLive && wasLive) {
            // Stream just ended
            this.isLive = false;
            Logger.info(`${CONFIG.twitch.username} stream has ended`);
            
        } else if (isNowLive) {
            Logger.debug(`${streamData.user_name} is still live`);
        } else {
            Logger.debug(`${CONFIG.twitch.username} is offline`);
        }
    }

    /**
     * Setup graceful shutdown handlers
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            Logger.info(`${signal} received, shutting down gracefully...`);
            
            try {
                this.stopMonitoring();
                await this.discordService.destroy();
                Logger.success('Shutdown complete');
                process.exit(0);
            } catch (error) {
                Logger.error('Error during shutdown:', error.message);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
    Logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    Logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Start the application
const monitor = new StreamMonitor();
monitor.start();