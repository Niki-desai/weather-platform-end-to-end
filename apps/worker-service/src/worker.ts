import 'dotenv/config';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';


const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('Connecting to Redis at:', redisUrl);

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null
});

redis.on('connect', () => {
    console.log('BullMQ worker connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

new Worker('weather-jobs', async job => {
    console.log('BullMQ processing', job.data.city);
}, { connection: redis });