const cron = require('node-cron');
const { CONFIG } = require('../config');
const Logger = require('../utils/logger');

/**
 * Service to manage scheduled tasks
 */
class SchedulerService {
    /**
     * @param {import('./twitch.service')} twitchService
     * @param {import('./discord.service')} discordService
     */
    constructor(twitchService, discordService) {
        this.twitchService = twitchService;
        this.discordService = discordService;
        this.scheduledTask = null;
    }

    /**
     * Start the scheduled tasks
     */
    start() {
        if (!CONFIG.features.topClips.isEnabled) {
            Logger.info('Top clips job is disabled (TOP_CLIPS_CHANNEL_ID not set)');

            return;
        }

        const schedule = CONFIG.features.topClips.schedule;
        
        if (!cron.validate(schedule)) {
            Logger.error(`Invalid cron schedule: ${schedule}. Clips job will not run.`);

            return;
        }

        Logger.info(`[SCHEDULER] Scheduling top clips job with schedule: ${schedule}`);
        
        this.scheduledTask = cron.schedule(schedule, () => {
            (async () => {
                await this.runTopClipsJob();
            })();
        }, {
            timezone: "Europe/Paris" 
        });
    }

    /**
     * Stop the scheduled tasks
     */
    stop() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            Logger.info('[SCHEDULER] Jobs stopped');
        }
    }

    /**
     * Execute the task to fetch and send clips
     */
    async runTopClipsJob() {
        Logger.info('[SCHEDULER] Running top clips job...');
        try {
            const { username } = CONFIG.twitch;
            const { count } = CONFIG.features.topClips;
            
            const clips = await this.twitchService.getTopClips(
                username,
                count,
                24 // Time period in hours
            );

            if (!clips || clips.length === 0) {
                Logger.info('[SCHEDULER] No clips found for the specified period. Skipping notification.');
                return;
            }

            const topClips = clips.slice(0, count);
            
            await this.discordService.sendTopClips(topClips);
        } catch (error) {
            Logger.error('[SCHEDULER] Error during top clips job:', error.message);
        }
    }
}

module.exports = SchedulerService;