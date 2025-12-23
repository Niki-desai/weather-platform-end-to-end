module.exports = {
    apps: [
        // API Gateway
        {
            name: 'api-gateway',
            script: 'apps/api-gateway/dist/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: 'logs/api-gateway-error.log',
            out_file: 'logs/api-gateway-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_memory_restart: '500M',
            autorestart: true,
            watch: false
        },

        // Worker Service - BullMQ Worker
        {
            name: 'worker-bullmq',
            script: 'apps/worker-service/dist/worker.js',
            instances: 2,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: 'logs/worker-bullmq-error.log',
            out_file: 'logs/worker-bullmq-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_memory_restart: '300M',
            autorestart: true,
            watch: false
        },

        // Worker Service - RabbitMQ Consumer
        {
            name: 'worker-rabbit',
            script: 'apps/worker-service/dist/rabbit.consumer.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: 'logs/worker-rabbit-error.log',
            out_file: 'logs/worker-rabbit-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            autorestart: true,
            watch: false
        },

        // Worker Service - Kafka Consumer
        {
            name: 'worker-kafka',
            script: 'apps/worker-service/dist/kafka.consumer.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: 'logs/worker-kafka-error.log',
            out_file: 'logs/worker-kafka-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            autorestart: true,
            watch: false
        }
    ]
};