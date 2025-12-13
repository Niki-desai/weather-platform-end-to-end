import { Redis } from 'ioredis';

const redis = new Redis({
  host: 'redis',     // docker service name
  port: 6379,
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error', err.message);
});

export default redis;
