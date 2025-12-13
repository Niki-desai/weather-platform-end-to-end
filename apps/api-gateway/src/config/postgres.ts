import { Pool } from 'pg';
// import { env } from './env';


export const pgPool = new Pool({
host: "localhost",
user: "weather",
password: "weather",
database: "weather_db",
port: 5432,
max: 10
});


// POSTGRES_USER=weather
// POSTGRES_PASSWORD=weather
// POSTGRES_DB=weather_db
// DATABASE_URL=postgresql://weather:weather@localhost:5432/weather_db
pgPool.on('connect', () => {
console.log('✅ Postgres connected');
});