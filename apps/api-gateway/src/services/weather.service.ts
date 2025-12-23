import axios from 'axios';
import { Redis } from 'ioredis';
import { publishJob } from './queue.service.js';
// import { publishJob } from './queue.service';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379
});

export async function fetchWeather(city: string) {
    const cacheKey = `weather:${city.toLowerCase()}`;

    try {
        // 1️⃣ Cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log('CACHE HIT');
            return JSON.parse(cached);
        }

        // 2️⃣ Geocoding
        const geoRes = await axios.get(
            'https://geocoding-api.open-meteo.com/v1/search',
            { params: { name: city, count: 1 } }
        );

        const geoData = geoRes.data?.results?.[0];
        if (!geoData) {
            throw new Error(`City not found: ${city}`);
        }

        const { latitude, longitude } = geoData;

        // 3️⃣ Weather
        const weatherRes = await axios.get(
            'https://api.open-meteo.com/v1/forecast',
            {
                params: {
                    latitude,
                    longitude,
                    hourly: 'temperature_2m'
                }
            }
        );

        const weatherData = weatherRes.data;

        // 4️⃣ Cache result
        await redis.set(cacheKey, JSON.stringify(weatherData), 'EX', 3600);
        console.log("Next one")
        // 5️⃣ Async job
        await publishJob(city, weatherData);

        return weatherData;
    } catch (err: any) {
        console.error('fetchWeather failed:', err.message);
        throw err;
    }
}
