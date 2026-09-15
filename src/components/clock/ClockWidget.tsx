import React, { useState, useEffect } from 'react';
import { ClockConfig } from '../../types';
import { formatDate } from '../../lib/utils';
import { Edit3 } from 'lucide-react';

interface ClockWidgetProps {
  config: ClockConfig;
  onOpenSettings?: (tab?: 'appearance' | 'wallpaper' | 'clock' | 'search' | 'widgets' | 'weather' | 'data') => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ config, onOpenSettings }) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const intervalTime = config.showSeconds ? 1000 : 5000;
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalTime);

    return () => clearInterval(timer);
  }, [config.showSeconds]);

  if (!config.enabled) return null;

  const hours = now.getHours();
  const rawMinutes = now.getMinutes().toString().padStart(2, '0');
  const rawSeconds = now.getSeconds().toString().padStart(2, '0');
  const is12h = config.format === '12h';

  let displayHours = hours;
  let ampm = '';
  if (is12h) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }

  const hoursStr = is12h ? displayHours.toString() : hours.toString().padStart(2, '0');
  const secondsPart = config.showSeconds ? `:${rawSeconds}` : '';
  const ampmPart = is12h ? ` ${ampm}` : '';

  const timeString = `${hoursStr}:${rawMinutes}${secondsPart}${ampmPart}`;

  // Mond Rainmeter clock date/day uppercase formatting
  const dayNamesUpper = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const monthNamesUpper = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayUpper = dayNamesUpper[now.getDay()];
  const dateUpper = `${now.getDate().toString().padStart(2, '0')}  ${monthNamesUpper[now.getMonth()]},  ${now.getFullYear()}.`;

  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const alignment = alignMap[config.alignment] || alignMap.center;

  // Rainmeter Mond Style (Day on top, Date in middle, Time in hyphens at bottom)
  if (config.style === 'mond' || config.style === 'modern' || !config.style) {
    return (
      <div className={`flex flex-col ${alignment} select-none transition-all duration-300 my-1 group relative`}>
        {/* MeterDay: Large Uppercase Tracked Heading with Anurati Font */}
        {config.showDay && (
          <div className="font-anurati text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.25em] text-white drop-shadow-2xl leading-none mb-1 transition-transform duration-300">
            {dayUpper}
          </div>
        )}

        {/* MeterDate: Subtitle Tracked Uppercase Date */}
        {config.showDate && (
          <div className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.25em] text-white/80 drop-shadow mb-1.5">
            {dateUpper}
          </div>
        )}

        {/* MeterClock: Time Enclosed in Hyphens with Quick Edit Icon */}
        <div className="flex items-center gap-2">
          <div className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.2em] text-white/90 drop-shadow-lg px-4 py-1.5 rounded-full bg-black/30 border border-white/15 backdrop-blur-md transition-colors hover:bg-black/40 hover:border-white/25">
            {`- ${timeString} -`}
          </div>

          {onOpenSettings && (
            <button
              onClick={() => onOpenSettings('clock')}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 backdrop-blur-md text-white/70 hover:text-white transition-all duration-300 shadow-sm hover:scale-110"
              title="Edit Clock, Name & Wallpaper Settings"
            >
              <Edit3 className="w-3.5 h-3.5 text-accent" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Classic / Minimal / Terminal / Bold fallback styles
  const { dayName, fullDate } = formatDate(now);
  const sizeMap = {
    sm: 'text-4xl md:text-5xl',
    md: 'text-5xl md:text-7xl',
    lg: 'text-6xl md:text-8xl',
    xl: 'text-7xl md:text-9xl',
    '2xl': 'text-8xl md:text-[10rem]',
  };
  const timeSize = sizeMap[config.fontSize] || sizeMap.xl;

  return (
    <div className={`flex flex-col ${alignment} select-none transition-all duration-300 group relative`}>
      <div className="flex items-center gap-3">
        <h1
          className={`font-bold tracking-tight text-white/95 drop-shadow-2xl ${timeSize} ${
            config.style === 'terminal' ? 'font-mono text-emerald-400' : ''
          } ${config.style === 'bold' ? 'font-black tracking-tighter' : ''} ${
            config.style === 'minimal' ? 'font-light tracking-widest' : ''
          }`}
        >
          {timeString}
        </h1>

        {onOpenSettings && (
          <button
            onClick={() => onOpenSettings('clock')}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white/70 hover:text-white transition-all duration-300 shadow-sm hover:scale-110"
            title="Edit Clock, Name & Wallpaper Settings"
          >
            <Edit3 className="w-4 h-4 text-accent" />
          </button>
        )}
      </div>

      {(config.showDate || config.showDay) && (
        <div className="mt-2 text-lg md:text-xl font-medium text-white/85 tracking-wide flex items-center gap-3 drop-shadow">
          {config.showDay && <span className="text-accent font-semibold">{dayName}</span>}
          {config.showDay && config.showDate && <span className="text-white/40">•</span>}
          {config.showDate && <span>{fullDate}</span>}
        </div>
      )}
    </div>
  );
};
