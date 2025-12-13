import 'dotenv/config';
import { Kafka } from 'kafkajs';


const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
console.log('Connecting to Kafka at:', kafkaBroker);

const kafka = new Kafka({
    brokers: [kafkaBroker]
});
const consumer = kafka.consumer({ groupId: 'analytics' });


(async () => {
    try {
        await consumer.connect();
        console.log('Kafka consumer connected');

        await consumer.subscribe({ topic: 'weather-events' });
        console.log('Subscribed to weather-events topic');

        await consumer.run({
            eachMessage: async ({ message }) => {
                console.log('Kafka event:', message.value?.toString());
            }
        });
    } catch (error) {
        console.error('Failed to connect to Kafka:', error);
        process.exit(1);
    }
})();