import { PrismaClient } from '@prisma/client'
import { parentPort } from 'worker_threads'
import Logger from '../../lib/logger.js'

const prisma = new PrismaClient()

async function runCronTask() {
    const now = new Date();
    const startTime = now.toISOString();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    
    Logger.info('CRON JOB EXECUTING', { 
        startTime, 
        seconds, 
        minutes,
        expectedAt: `${minutes}:00`
    });

    try {
        const timestamp = Date.now();
        const carRecord = await prisma.car.create({
            data: {
                brand: new Date().toISOString(),
                licensePlate: `------${timestamp}`, 
                year: 2025,
                fuelTypeId: 1,
                driverName: "Anita"
            }
        });

        Logger.success('Created new car record', {
            id: carRecord.id,
            brand: carRecord.brand,
            licensePlate: carRecord.licensePlate,
            year: carRecord.year,
            fuelTypeId: carRecord.fuelTypeId,
            driverName: carRecord.driverName
        });
    } catch (error) {
        Logger.error('Error creating car record', { error: error.message, stack: error.stack });
    } finally {
        await prisma.$disconnect();
        if (parentPort) {
            parentPort.postMessage('done');
        }
    }
}

runCronTask();
