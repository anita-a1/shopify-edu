import cron from './cron/index.js';
import Logger from './lib/logger.js';

Logger.info('Initializing server - starting cron jobs...');

cron.start()
    .then(() => {
        Logger.success('Cron jobs started successfully');
    })
    .catch((error) => {
        Logger.error('Failed to start cron jobs', { error: error.message, stack: error.stack });
    });

export default cron;
