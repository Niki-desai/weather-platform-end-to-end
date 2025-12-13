import { Router } from 'express';
import { getWeather } from '../controllers/weather.controller.js';
// import { getWeather } from '../controllers/weather.controller';

const router = Router();

console.log('Weather routes registered');

router.get('/:city', (req, res, next) => {
    console.log('Weather route hit with city:', req.params.city);
    next();
}, getWeather);


export default router;