import { useState, useCallback } from 'react';
import { WeatherData } from '@/types/flood';

const OPENWEATHER_API_KEY = ''; // User needs to add their own key

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (lat: number, lng: number) => Promise<void>;
}

// Mock weather data for demo
const mockWeatherData: WeatherData = {
  temperature: 28,
  humidity: 85,
  rainfall: 45,
  windSpeed: 15,
  description: 'Heavy Rain',
  icon: '10d',
  forecast: [
    { time: '12:00', rainfall: 35, temperature: 27 },
    { time: '15:00', rainfall: 55, temperature: 26 },
    { time: '18:00', rainfall: 70, temperature: 25 },
    { time: '21:00', rainfall: 45, temperature: 24 },
    { time: '00:00', rainfall: 20, temperature: 23 },
  ],
};

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!OPENWEATHER_API_KEY) {
        // Use mock data if no API key
        await new Promise(resolve => setTimeout(resolve, 500));
        // Add some randomization to make it feel real
        const randomRainfall = Math.floor(Math.random() * 80) + 10;
        setWeather({
          ...mockWeatherData,
          rainfall: randomRainfall,
          forecast: mockWeatherData.forecast.map(f => ({
            ...f,
            rainfall: Math.floor(Math.random() * 100),
          })),
        });
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      
      // Get forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=5`
      );
      const forecastData = await forecastResponse.json();

      setWeather({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        forecast: forecastData.list.map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          rainfall: item.rain?.['3h'] || 0,
          temperature: Math.round(item.main.temp),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      // Fallback to mock data
      setWeather(mockWeatherData);
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, fetchWeather };
}
