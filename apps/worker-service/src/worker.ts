import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
// import { uploadToS3 } from './s3.js';
// import { uploadToGCS } from './gcs.js';  // Commented out - causes crash without GCS_BUCKET
import { uploadToCloud } from './storage.js';

// Load .env from project root
dotenv.config({ path: '../../.env' });


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
    console.log('🔔 BullMQ job received!');
    console.log('   Job ID:', job.id);
    console.log('   Job data:', JSON.stringify(job.data, null, 2));
    console.log('   City:', job.data.city);

    try {
        console.log('📤 Starting S3 upload...');
        await uploadToCloud(job.data.city, job.data.data);
        console.log('✅ BullMQ processing completed for', job.data.city);
    } catch (error: any) {
        console.error('❌ BullMQ job failed:', error.message);
        throw error;
    }
}, { connection: redis });

console.log('✅ BullMQ Worker initialized and listening for jobs on queue: weather-jobs');