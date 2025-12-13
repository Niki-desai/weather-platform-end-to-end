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
    try {
        await queue.add('weather', { city, data });
    } catch (e) {
        console.error('BullMQ failed');
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
