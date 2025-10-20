/**
 * Simple logger utility with emoji prefixes
 */
class Logger {
    /**
     * Format current date and time
     * @returns {string} Formatted timestamp
     */
    static getTimestamp() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    static info(message, ...args) {
        console.log(`[${this.getTimestamp()}] [INFO] ${message}`, ...args);
    }

    static success(message, ...args) {
        console.log(`[${this.getTimestamp()}] [SUCCESS] ${message}`, ...args);
    }

    static error(message, ...args) {
        console.error(`[${this.getTimestamp()}] [ERROR] ${message}`, ...args);
    }

    static warn(message, ...args) {
        console.warn(`[${this.getTimestamp()}] [WARN] ${message}`, ...args);
    }

    static debug(message, ...args) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[${this.getTimestamp()}] [DEBUG] ${message}`, ...args);
        }
    }
}

module.exports = Logger;