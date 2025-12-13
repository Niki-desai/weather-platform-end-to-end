# Weather Platform - Quick Start Guide

## 🚀 Running Locally (Outside Docker)

### Prerequisites
- Node.js installed
- Docker Desktop running (for infrastructure services)

### Steps

1. **Start Infrastructure Services**
   ```bash
   cd c:\Users\nikit\Downloads\Personal\weather-platform
   docker-compose up -d redis rabbitmq kafka zookeeper postgres
   ```

2. **Start API Gateway**
   ```bash
   cd apps\api-gateway
   npm run start
   ```

3. **Start Worker Service**
   ```bash
   cd apps\worker-service
   npm run start
   ```

4. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Weather endpoint
   curl http://localhost:3000/api/weather/London
   ```

---

## 🐳 Running with Docker Compose (Full Stack)

### Steps

1. **Build and Start All Services**
   ```bash
   cd c:\Users\nikit\Downloads\Personal\weather-platform
   docker-compose up --build
   ```

2. **Test the API**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/weather/London
   ```

---

## 📝 Environment Files

- **`.env`** - Used for local development (localhost connections)
- **`.env.docker`** - Used for Docker Compose (Docker service names)

The docker-compose.yml automatically uses `.env.docker` for container networking.

---

## 🔧 Troubleshooting

### Redis Connection Errors
- **Local**: Make sure Redis container is running: `docker ps | grep redis`
- **Docker**: Check `.env.docker` has `REDIS_URL=redis://redis:6379`

### Kafka Connection Errors
- **Local**: Make sure Kafka is running: `docker ps | grep kafka`
- **Docker**: Check `.env.docker` has `KAFKA_BROKER=kafka:9092`

### API Not Responding
- Check server logs for errors
- Verify Redis is accessible
- Test health endpoint first: `http://localhost:3000/health`

---

## 📍 API Endpoints

- **Health Check**: `GET http://localhost:3000/health`
- **Weather Data**: `GET http://localhost:3000/api/weather/:city`
  - Example: `http://localhost:3000/api/weather/London`
  - Example: `http://localhost:3000/api/weather/New%20York`
