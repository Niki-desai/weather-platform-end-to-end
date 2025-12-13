import type { Request, Response } from 'express';
import * as weatherService from '../services/weather.service.js';

export const getWeather = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { city } = req.params;
    console.log("city", city)
    if (!city) {
      res.status(400).json({ error: 'City is required' });
      return;
    }

    const data = await weatherService.fetchWeather(city);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
};


