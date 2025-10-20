const Logger = require('./logger');

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error should be retried
 */
function isRetryableError(error) {
    const retryableCodes = [
        'EAI_AGAIN',
        'ETIMEDOUT',
        'ECONNRESET',
        'ENOTFOUND',
        'EHOSTUNREACH',
        'ECONNREFUSED'
    ];
    
    return retryableCodes.includes(error.code) || 
           error.response?.status === 429 || // Rate limit
           (error.response?.status >= 500 && error.response?.status < 600); // Server errors
}

/**
 * Execute a function with retry logic
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.baseDelay - Base delay in milliseconds
 * @param {boolean} options.exponentialBackoff - Use exponential backoff
 * @returns {Promise<any>} Result of the function
 */
async function withRetry(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 2000,
        exponentialBackoff = true
    } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            const shouldRetry = isRetryableError(error);

            if (shouldRetry && !isLastAttempt) {
                const delay = exponentialBackoff 
                    ? baseDelay * attempt 
                    : baseDelay;
                    
                Logger.warn(
                    `Attempt ${attempt}/${maxRetries} failed: ${error.code || error.message}`
                );
                Logger.info(`Retrying in ${delay}ms...`);
                
                await sleep(delay);
                continue;
            }

            throw error;
        }
    }
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { withRetry, isRetryableError, sleep };