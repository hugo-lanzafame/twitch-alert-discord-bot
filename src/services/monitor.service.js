const { CONFIG } = require('../config');
const Logger = require('../utils/logger');

/**
 * Service responsible for continuous monitoring.
 */
class MonitorService {
    /**
     * @param {import('./twitch.service')} twitchService
     * @param {import('./discord.service')} discordService
     */
    constructor(twitchService, discordService) {
        this.twitchService = twitchService;
        this.discordService = discordService;
        this.isLive = false;
        this.checkInProgress = false;
        this.checkTimer = null;

        // Use global config settings
        this.twitchUsername = CONFIG.twitch.username;

        // Use feature liveNotification config settings
        this.liveNotificationCheckInterval = CONFIG.features.liveNotification.checkInterval;
        this.liveNotificationsEnabled = CONFIG.features.liveNotification.isEnabled;
    }

    /**
     * Start the monitoring loop
     */
    start() {
        if (!this.liveNotificationsEnabled) {
            Logger.info('[MONITOR] Live notification feature is disabled.');

            return;
        }
        
        Logger.info(`[MONITOR] Monitoring ${this.twitchUsername} every ${this.liveNotificationCheckInterval}ms`);
        
        // First check immediately
        this.checkStreamStatus();
        
        // Schedule regular checks
        this.checkTimer = setInterval(() => {
            this.checkStreamStatus();
        }, this.liveNotificationCheckInterval);
    }

    /**
     * Stop the monitoring loop
     */
    stop() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
            Logger.info('[MONITOR] Monitoring stopped');
        }
    }

    /**
     * Check the current stream status
     */
    async checkStreamStatus() {
        if (this.checkInProgress) {
            Logger.debug('[MONITOR] Check already in progress, skipping...');

            return;
        }

        this.checkInProgress = true;

        try {
            const streamData = await this.twitchService.getStreamData(this.twitchUsername);
            await this.handleStreamStatusChange(streamData);
        } catch (error) {
            Logger.error('[MONITOR] Error checking stream status:', error.message);
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
            this.isLive = true;
            Logger.info(`[MONITOR] ${streamData.user_name} is now LIVE!`);
            
            try {
                await this.discordService.sendLiveNotification(streamData);
            } catch (error) {
                Logger.error('Failed to send notification:', error.message);
            }
        } else if (!isNowLive && wasLive) {
            this.isLive = false;
            Logger.info(`[MONITOR] ${this.twitchUsername} stream has ended`);
        } else if (isNowLive) {
            Logger.debug(`[MONITOR] ${streamData.user_name} is still live`);
        } else {
            Logger.debug(`[MONITOR] ${this.twitchUsername} is offline`);
        }
    }
}

module.exports = MonitorService;