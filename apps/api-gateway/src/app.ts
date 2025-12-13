import express from 'express';
import weatherRoutes from './routes/weather.routes.js';
import healthRoutes from './routes/health.routes.js';
import { rateLimiter } from './middlewares/rateLimiter.js';


const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    next();
});

app.use(rateLimiter);

console.log('Registering /api/weather routes...');
app.use('/api/weather', weatherRoutes);
console.log('Registering /health routes...');
app.use('/health', healthRoutes);

// 404 handler
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.url);
    res.status(404).json({ error: 'Route not found' });
});


export default app;