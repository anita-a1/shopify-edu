import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '../../logs/cron.log');

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        // Write to file
        fs.appendFileSync(LOG_FILE, logLine);
        
        // Also output to console
        const emoji = {
            'INFO': 'ℹ️',
            'SUCCESS': '✅',
            'ERROR': '❌',
            'WARN': '⚠️'
        }[level] || '📝';
        
        console.log(`${emoji} [${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    
    static info(message, data = null) {
        this.log('INFO', message, data);
    }
    
    static success(message, data = null) {
        this.log('SUCCESS', message, data);
    }
    
    static error(message, data = null) {
        this.log('ERROR', message, data);
    }
    
    static warn(message, data = null) {
        this.log('WARN', message, data);
    }
    
    static getLogs(limit = 100) {
        try {
            if (!fs.existsSync(LOG_FILE)) {
                return [];
            }
            
            const content = fs.readFileSync(LOG_FILE, 'utf8');
            const lines = content.trim().split('\n').filter(line => line.trim());
            const logs = lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { timestamp: new Date().toISOString(), level: 'ERROR', message: 'Invalid log entry', data: line };
                }
            });
            
            return logs.slice(-limit);
        } catch (error) {
            return [{ timestamp: new Date().toISOString(), level: 'ERROR', message: 'Failed to read logs', data: error.message }];
        }
    }
}

export default Logger;
