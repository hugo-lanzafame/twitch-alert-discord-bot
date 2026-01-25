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
        this.userId = null;
        
        // Use twitch config settings
        this.apiBaseUrl = CONFIG.twitch.apiBaseUrl;
        this.authUrl = CONFIG.twitch.authUrl;
        this.clientId = CONFIG.twitch.clientId;
        this.clientSecret = CONFIG.twitch.clientSecret;
        this.username = CONFIG.twitch.username;
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
                this.authUrl,
                null,
                {
                    params: {
                        client_id: this.clientId,
                        client_secret: this.clientSecret,
                        grant_type: 'client_credentials'
                    },
                    timeout: CONFIG.apiSettings.requestTimeout
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
     * Get the permanent User ID from the username
     * @param {string} username - Twitch username
     * @returns {Promise<string>} User ID
     */
    async getUserId(username) {
        if (this.userId) {
            return this.userId;
        }

        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${this.apiBaseUrl}/users`,
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        login: username
                    },
                    timeout: CONFIG.apiSettings.requestTimeout
                }
            );

            if (response.data.data.length === 0) {
                throw new Error(`Twitch user not found: ${username}`);
            }

            this.userId = response.data.data[0].id;
            Logger.info(`Twitch User ID for ${username} is ${this.userId}`);

            return this.userId;
        } catch (error) {
            Logger.error('Failed to get Twitch user ID:', error.message);

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
                        `${this.apiBaseUrl}/streams`,
                        {
                            headers: {
                                'Client-ID': this.clientId,
                                'Authorization': `Bearer ${token}`
                            },
                            params: {
                                user_login: username
                            },
                            timeout: CONFIG.apiSettings.requestTimeout
                        }
                    );

                    return response.data.data[0] || null;
                },
                {
                    maxRetries: CONFIG.apiSettings.maxRetries,
                    baseDelay: CONFIG.apiSettings.retryDelay
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
     * Get top clips for a user
     * @param {string} username - Twitch username
     * @param {number} count - Number of clips to retrieve
     * @param {number} hours - Timeframe in hours
     * @returns {Promise<Object[]>} List of clips
     */
    async getTopClips(username, count, hours) {
        try {
            const token = await this.getAccessToken();
            const broadcasterId = await this.getUserId(username);

            // Calculate the start time for the search window
            const startTime = new Date(
                Date.now() - hours * 60 * 60 * 1000
            ).toISOString();
            
            const endTime = new Date().toISOString();

            const clipsData = await withRetry(
                async () => {
                    const response = await axios.get(
                        `${this.apiBaseUrl}/clips`,
                        {
                            headers: {
                                'Client-ID': this.clientId,
                                'Authorization': `Bearer ${token}`
                            },
                            params: {
                                broadcaster_id: broadcasterId,
                                started_at: startTime,
                                ended_at: endTime,
                                first: count
                            },
                            timeout: CONFIG.apiSettings.requestTimeout
                        }
                    );
                    // Twitch API automatically sorts by views (which is perfect)
                    return response.data.data || [];
                },
                {
                    maxRetries: CONFIG.apiSettings.maxRetries,
                    baseDelay: CONFIG.apiSettings.retryDelay
                }
            );

            return clipsData;
        } catch (error) {
            Logger.error('Failed to get top clips:', error.message);
            
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