import 'dotenv/config';
import amqp from 'amqplib';


(async () => {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        console.log('Connecting to RabbitMQ at:', rabbitmqUrl);

        const conn = await amqp.connect(rabbitmqUrl);
        const ch = await conn.createChannel();
        await ch.assertQueue('weather_tasks');

        console.log('RabbitMQ consumer ready, waiting for messages...');

        ch.consume('weather_tasks', msg => {
            console.log('RabbitMQ:', msg?.content.toString());
            ch.ack(msg!);
        });
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
})();