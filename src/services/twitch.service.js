const axios = require('axios');
const { CONFIG } = require('../config');
const Logger = require('../utils/logger');
const { withRetry } = require('../utils/retry');

/**
 * Service to interact with Twitch API
 */
class TwitchService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiresAt = null;
        this.baseURL = 'https://api.twitch.tv/helix';
        this.authURL = 'https://id.twitch.tv/oauth2/token';
    }

    /**
     * Check if the current token is valid
     * @returns {boolean} True if token is valid
     */
    isTokenValid() {
        return this.accessToken && 
               this.tokenExpiresAt && 
               Date.now() < this.tokenExpiresAt;
    }

    /**
     * Get or refresh Twitch access token
     * @returns {Promise<string>} Access token
     */
    async getAccessToken() {
        if (this.isTokenValid()) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(
                this.authURL,
                null,
                {
                    params: {
                        client_id: CONFIG.twitch.clientId,
                        client_secret: CONFIG.twitch.clientSecret,
                        grant_type: 'client_credentials'
                    },
                    timeout: CONFIG.monitor.requestTimeout
                }
            );

            this.accessToken = response.data.access_token;
            // Subtract 5 minutes to refresh before expiration
            this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 300000;
            
            Logger.success('Twitch access token obtained');
            return this.accessToken;
            
        } catch (error) {
            Logger.error('Failed to get Twitch access token:', error.message);
            throw error;
        }
    }

    /**
     * Get stream data for a user
     * @param {string} username - Twitch username
     * @returns {Promise<Object|null>} Stream data or null if offline
     */
    async getStreamData(username) {
        try {
            const token = await this.getAccessToken();

            const streamData = await withRetry(
                async () => {
                    const response = await axios.get(
                        `${this.baseURL}/streams`,
                        {
                            headers: {
                                'Client-ID': CONFIG.twitch.clientId,
                                'Authorization': `Bearer ${token}`
                            },
                            params: {
                                user_login: username
                            },
                            timeout: CONFIG.monitor.requestTimeout
                        }
                    );
                    return response.data.data[0] || null;
                },
                {
                    maxRetries: CONFIG.monitor.maxRetries,
                    baseDelay: CONFIG.monitor.retryDelay
                }
            );

            return streamData;

        } catch (error) {
            // Reset token on authentication error
            if (error.response?.status === 401) {
                Logger.warn('Token expired, will refresh on next request');
                this.accessToken = null;
                this.tokenExpiresAt = null;
            }
            
            throw error;
        }
    }

    /**
     * Check if a user is currently live
     * @param {string} username - Twitch username
     * @returns {Promise<boolean>} True if user is live
     */
    async isLive(username) {
        const streamData = await this.getStreamData(username);
        return !!streamData;
    }
}

module.exports = TwitchService;