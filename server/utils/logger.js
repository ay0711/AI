// Simple logging utility that can be easily disabled
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

module.exports = logger;