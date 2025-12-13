import type { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.js';
// import { redis } from '../config/redis';


export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const key = `rate:${ip}`;


    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);


    if (count > 60) {
        return res.status(429).json({ error: 'Too many requests' });
    }


    next();
}