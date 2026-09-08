import { useState, useEffect, useCallback } from 'react';
import { WeatherConfig } from '../types';

export interface WeatherData {
  city: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

// Weather code mapping to conditions & icons
export function getWeatherCondition(code: number): { text: string; icon: string } {
  if (code === 0) return { text: 'Clear Sky', icon: 'sun' };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code >= 45 && code <= 48) return { text: 'Foggy', icon: 'cloud-fog' };
  if (code >= 51 && code <= 67) return { text: 'Rainy', icon: 'cloud-rain' };
  if (code >= 71 && code <= 77) return { text: 'Snowy', icon: 'snowflake' };
  if (code >= 80 && code <= 82) return { text: 'Showers', icon: 'cloud-drizzle' };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', icon: 'cloud-lightning' };
  return { text: 'Clear', icon: 'sun' };
}

export function useWeather(config: WeatherConfig) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!config.enabled) return;
    setLoading(true);
    setError(null);

    try {
      let lat = config.lat || 23.8103; // Default Dhaka
      let lon = config.lon || 90.4125;
      let cityName = config.city || 'Dhaka';

      // Geolocation or city search
      if (config.useGeolocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch {
          // Fall back to city search
        }
      }

      // If city search requested and no geolocated coords
      if (!config.useGeolocation && config.city) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(config.city)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (geoData && geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          cityName = geoData.results[0].name;
        }
      }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&hourly=relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=auto`
      );
      const weatherJson = await weatherRes.json();

      if (weatherJson && weatherJson.current_weather) {
        const current = weatherJson.current_weather;
        const conditionInfo = getWeatherCondition(current.weathercode);

        // Temp conversions
        const isFahrenheit = config.unit === 'f';
        const rawTemp = current.temperature;
        const temp = isFahrenheit ? (rawTemp * 9) / 5 + 32 : rawTemp;

        const maxRaw = weatherJson.daily?.temperature_2m_max?.[0] ?? rawTemp + 2;
        const minRaw = weatherJson.daily?.temperature_2m_min?.[0] ?? rawTemp - 4;

        const tempMax = isFahrenheit ? (maxRaw * 9) / 5 + 32 : maxRaw;
        const tempMin = isFahrenheit ? (minRaw * 9) / 5 + 32 : minRaw;

        const humidity = weatherJson.hourly?.relative_humidity_2m?.[0] ?? 60;
        const feelsRaw = weatherJson.hourly?.apparent_temperature?.[0] ?? rawTemp;
        const feelsLike = isFahrenheit ? (feelsRaw * 9) / 5 + 32 : feelsRaw;

        setData({
          city: cityName,
          temp: Math.round(temp),
          tempMin: Math.round(tempMin),
          tempMax: Math.round(tempMax),
          condition: conditionInfo.text,
          weatherCode: current.weathercode,
          humidity,
          windSpeed: Math.round(current.windspeed),
          feelsLike: Math.round(feelsLike),
        });
      } else {
        throw new Error('Weather data unavailable');
      }
    } catch (err) {
      console.warn('Weather fetch error', err);
      setError('Unable to load weather');
      // Fallback mock weather for aesthetic demo offline robustness
      setData({
        city: config.city || 'Dhaka',
        temp: config.unit === 'f' ? 82 : 28,
        tempMin: config.unit === 'f' ? 75 : 24,
        tempMax: config.unit === 'f' ? 88 : 31,
        condition: 'Clear Sky',
        weatherCode: 0,
        humidity: 55,
        windSpeed: 12,
        feelsLike: config.unit === 'f' ? 84 : 29,
      });
    } finally {
      setLoading(false);
    }
  }, [config.enabled, config.city, config.unit, config.useGeolocation, config.lat, config.lon]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 mins
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { data, loading, error, refresh: fetchWeather };
}
