import React, { useState } from 'react';
import { WeatherConfig } from '../../types';
import { useWeather } from '../../hooks/useWeather';
import { Sun, CloudSun, CloudRain, Snowflake, CloudDrizzle, CloudLightning, CloudFog, Wind, Droplets, RefreshCw } from 'lucide-react';

interface WeatherWidgetProps {
  config: WeatherConfig;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ config }) => {
  const { data, loading, refresh } = useWeather(config);
  const [showDetails, setShowDetails] = useState(false);

  if (!config.enabled) return null;

  const renderIcon = (code: number = 0) => {
    if (code === 0) return <Sun className="w-7 h-7 text-amber-400" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-7 h-7 text-sky-300" />;
    if (code >= 45 && code <= 48) return <CloudFog className="w-7 h-7 text-slate-300" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-7 h-7 text-blue-400" />;
    if (code >= 71 && code <= 77) return <Snowflake className="w-7 h-7 text-cyan-200" />;
    if (code >= 80 && code <= 82) return <CloudDrizzle className="w-7 h-7 text-teal-300" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="w-7 h-7 text-yellow-400" />;
    return <Sun className="w-7 h-7 text-amber-400" />;
  };

  return (
    <div className="relative z-10">
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="glass-panel p-3.5 px-4 rounded-2xl cursor-pointer hover:bg-white/15 transition-all shadow-glass flex items-center gap-3 select-none"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-white/70">
            <RefreshCw className="w-4 h-4 animate-spin text-accent" />
            <span>Updating weather...</span>
          </div>
        ) : data ? (
          <>
            <div className="p-2 rounded-xl bg-white/10">{renderIcon(data.weatherCode)}</div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white tracking-tight">{data.temp}°</span>
                <span className="text-xs font-semibold text-accent uppercase">{config.unit}</span>
              </div>
              <div className="text-xs font-medium text-white/80">{data.city}</div>
            </div>
          </>
        ) : null}
      </div>

      {/* Expanded weather details popup */}
      {showDetails && data && (
        <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-4 shadow-2xl z-30 border border-white/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div>
              <h4 className="text-sm font-semibold text-white">{data.city}</h4>
              <p className="text-xs text-white/60">{data.condition}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                refresh();
              }}
              className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              title="Refresh weather"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-white/50 block text-[10px]">Feels like</span>
                <span className="font-semibold text-white">{data.feelsLike}°</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-white/50 block text-[10px]">Humidity</span>
                <span className="font-semibold text-white">{data.humidity}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <Wind className="w-4 h-4 text-teal-300" />
              <div>
                <span className="text-white/50 block text-[10px]">Wind</span>
                <span className="font-semibold text-white">{data.windSpeed} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <span className="text-xs font-bold text-accent">H / L</span>
              <div>
                <span className="text-white/50 block text-[10px]">High/Low</span>
                <span className="font-semibold text-white">{data.tempMax}° / {data.tempMin}°</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
