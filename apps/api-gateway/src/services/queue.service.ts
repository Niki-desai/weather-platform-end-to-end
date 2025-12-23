import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import amqp from 'amqplib';
import { Kafka } from 'kafkajs';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379
});

const queue = new Queue('weather-jobs', { connection: redis });

export async function publishJob(city: string, data: any) {
    console.log("📋 Publishing job for city:", city);
    console.log("   Data size:", JSON.stringify(data).length, "bytes");

    try {
        const job = await queue.add('weather', { city, data });
        console.log("✅ BullMQ job published successfully!");
        console.log("   Job ID:", job.id);
        console.log("   Queue: weather-jobs");
    } catch (e: any) {
        console.error('❌ BullMQ failed:', e.message);
        console.error('   Error details:', e);
    }

    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL!);
        const ch = await conn.createChannel();
        await ch.assertQueue('weather_tasks');
        ch.sendToQueue('weather_tasks', Buffer.from(JSON.stringify({ city })));
    } catch (e) {
        console.error('RabbitMQ failed');
    }

    try {
        const kafka = new Kafka({
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
        });
        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic: 'weather-events',
            messages: [{ value: JSON.stringify({ city }) }]
        });
    } catch (e) {
        console.error('Kafka failed');
    }
}
