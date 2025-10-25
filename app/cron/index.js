import Bree from 'bree'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const bree = new Bree({
    root: path.join(__dirname, 'jobs'),
    jobs: [
        {
            name: 'car-record',
            cron: '* * * * *', // Every minute (minute hour day month weekday)
            cronValidate: {
                override: {
                    useBlankDay: false
                }
            }
        },
    ],
});

// Add event listeners for debugging
bree.on('worker created', (name) => {
    console.log(`🔧 Worker created for job: ${name}`);
});

bree.on('worker deleted', (name) => {
    console.log(`🗑️ Worker deleted for job: ${name}`);
});

bree.on('worker message', (name, message) => {
    console.log(`📨 Message from worker ${name}:`, message);
});

bree.on('error', (error) => {
    console.error('❌ Bree error:', error);
});

async function initializeGraceful() {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV !== 'development') {
        const { default: Graceful } = await import('@ladjs/graceful')
        const graceful = new Graceful({ brees: [bree] })
        graceful.listen()
    }
}

initializeGraceful().catch(console.error);

export default bree;