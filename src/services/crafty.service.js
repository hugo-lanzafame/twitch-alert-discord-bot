const axios = require('axios');
const { CONFIG } = require('../config');
const Logger = require('../utils/logger');
const { withRetry } = require('../utils/retry');

const CRAFTY_ACTIONS = {
    START: 'start',
    STOP: 'stop',
    RESTART: 'restart'
};

/**
 * Service to interact with Crafty API
 */
class CraftyService {
    constructor() {
        this.apiBaseUrl = CONFIG.features.crafty.apiBaseUrl;
        this.apiToken = CONFIG.features.crafty.apiToken;
        this.minecraftServerId = CONFIG.features.crafty.minecraftServerId;

        const https = require('https');

        this.api = axios.create({
            baseURL: this.apiBaseUrl,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.apiSettings.requestTimeout
        });
    }

    /**
     * Run an action (start/stop/restart) on the Minecraft server.
     * @param {string} action 
     * @returns {Promise<Object>}
     */
    async runAction(action) {
        return await withRetry(
            async () => {
                const response = await this.api.post(`/servers/${this.minecraftServerId}/action/${action}`);
                Logger.success(`[CRAFTY] Action ${action} sent to minecraft server`);
                return response.data;
            },
            {
                maxRetries: CONFIG.apiSettings.maxRetries,
                baseDelay: CONFIG.apiSettings.retryDelay
            }
        );
    }

    /**
     * Start the Minecraft server
     */
    async startMinecraftServer() {
        return await this.runAction(CRAFTY_ACTIONS.START);
    }

    /**
     * Stop the minecraft server
     */
    async stopMinecraftServer() {
        return await this.runAction(CRAFTY_ACTIONS.STOP);
    }

    /**
     * Restart the minecraft server
     */
    async restartMinecraftServer() {
        return await this.runAction(CRAFTY_ACTIONS.RESTART);
    }

    /**
     * Retrieves statistics from the server
     * @returns {Promise<Object>}
     */
    async getMinecraftServerInfo() {
        try {
            return await withRetry(
                async () => {
                    const response = await this.api.get(`/servers/${this.minecraftServerId}/stats`);
                    Logger.success(`[CRAFTY] Stats retrieves from minecraft server`);
                    return response.data;
                },
                {
                    maxRetries: CONFIG.apiSettings.maxRetries,
                    baseDelay: CONFIG.apiSettings.retryDelay
                }
            );
        } catch (error) {
            Logger.error(`[CRAFTY] Failed to fetch server stats: ${error.message}`);
            throw error;
        }
    }
}

module.exports = CraftyService;