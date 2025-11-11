const { CONFIG, validateConfig } = require('./config');
const TwitchService = require('./services/twitch.service');
const DiscordService = require('./services/discord.service');
const SchedulerService = require('./services/scheduler.service');
const MonitorService = require('./services/monitor.service'); // New Monitor Service
const Logger = require('./utils/logger');

/**
 * Main application Orchestrator
 */
class BotOrchestrator {
    constructor() {
        // Initialize Core Services
        this.twitchService = new TwitchService();
        this.discordService = new DiscordService();
        
        // Initialize Feature Services (Dependency Injection)
        this.monitorService = new MonitorService(this.twitchService, this.discordService);
        this.schedulerService = new SchedulerService(this.twitchService, this.discordService); 
    }

    /**
     * Initialize and start the bot
     */
    async start() {
        try {
            validateConfig();
            Logger.success('Configuration validated');

            this.setupGracefulShutdown();

            await this.discordService.login();
            await this.discordService.waitUntilReady();
            
            this.monitorService.start();
            this.schedulerService.start();
        } catch (error) {
            Logger.error('Fatal error during startup:', error.message);
            process.exit(1);
        }
    }

    /**
     * Setup graceful shutdown handlers
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            Logger.info(`${signal} received, shutting down gracefully...`);
            
            try {
                this.monitorService.stop(); 
                this.schedulerService.stop(); 
                
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
const bot = new BotOrchestrator();
bot.start();