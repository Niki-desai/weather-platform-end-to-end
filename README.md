feat: setup microservice backend with API gateway, worker, queues, and caching

- Initialize Node.js + TypeScript monorepo structure
- Add API Gateway service with Express
- Implement weather fetch flow using Open-Meteo + geocoding API
- Integrate Redis for caching weather responses
- Configure PostgreSQL connection layer
- Add BullMQ for background job processing
- Integrate RabbitMQ and Kafka for event-based messaging
- Implement worker service with BullMQ, RabbitMQ, and Kafka consumers
- Add Dockerfiles for all services
- Configure docker-compose with Redis, Postgres, Kafka, RabbitMQ, and Nginx
- Setup Nginx reverse proxy for API routing
- Add health check endpoint and structured folder layout


//////////////////////

STEP 3 → Cloud Storage (AWS S3 + GCS) [worker uploads]  --- on it
STEP 4 → PM2 + EC2 deployment (prod) - on it
STEP 5 → Observability (Prometheus + Node Exporter + Grafana)
STEP 6 → Kafka Stream Consumer (real analytics)
STEP 7 → Docker Swarm / ECS (orchestration)
