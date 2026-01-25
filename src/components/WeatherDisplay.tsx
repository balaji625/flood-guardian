import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, CloudRain, TrendingUp } from 'lucide-react';
import { WeatherData } from '@/types/flood';
import { cn } from '@/lib/utils';

interface WeatherDisplayProps {
  weather: WeatherData;
  className?: string;
}

export function WeatherDisplay({ weather, className }: WeatherDisplayProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Current conditions */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold font-mono">{weather.temperature}°</div>
          <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-mono font-bold">{weather.rainfall} mm/hr</div>
              <div className="text-xs text-muted-foreground">Rainfall</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-mono font-bold">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-mono font-bold">{weather.windSpeed} km/h</div>
              <div className="text-xs text-muted-foreground">Wind</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-mono font-bold">{weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground">Feels like</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rainfall Forecast */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Rainfall Forecast</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-24">
          {weather.forecast.map((item, index) => {
            const maxRainfall = Math.max(...weather.forecast.map(f => f.rainfall), 10);
            const height = Math.max((item.rainfall / maxRainfall) * 100, 5);
            
            return (
              <motion.div
                key={item.time}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'w-full rounded-t-md transition-colors',
                    item.rainfall > 50 ? 'bg-destructive' :
                    item.rainfall > 25 ? 'bg-warning' :
                    'bg-primary'
                  )}
                  style={{ height: '100%' }}
                />
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
