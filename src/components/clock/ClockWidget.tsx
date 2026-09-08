import React, { useState, useEffect } from 'react';
import { ClockConfig } from '../../types';
import { formatTime, formatDate } from '../../lib/utils';

interface ClockWidgetProps {
  config: ClockConfig;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ config }) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // Update every second if seconds shown, or every 10 seconds to stay efficient
    const intervalTime = config.showSeconds ? 1000 : 5000;
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalTime);

    return () => clearInterval(timer);
  }, [config.showSeconds]);

  if (!config.enabled) return null;

  const timeString = formatTime(now, config.format === '12h', config.showSeconds);
  const { dayName, fullDate } = formatDate(now);

  // Font size classes
  const sizeMap = {
    sm: 'text-4xl md:text-5xl',
    md: 'text-5xl md:text-7xl',
    lg: 'text-6xl md:text-8xl',
    xl: 'text-7xl md:text-9xl',
    '2xl': 'text-8xl md:text-[10rem]',
  };

  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const timeSize = sizeMap[config.fontSize] || sizeMap.xl;
  const alignment = alignMap[config.alignment] || alignMap.center;

  return (
    <div className={`flex flex-col ${alignment} select-none transition-all duration-300`}>
      {/* Clock Time */}
      <h1
        className={`font-bold tracking-tight text-white/95 drop-shadow-2xl ${timeSize} ${
          config.style === 'terminal' ? 'font-mono text-emerald-400' : ''
        } ${config.style === 'bold' ? 'font-black tracking-tighter' : ''} ${
          config.style === 'minimal' ? 'font-light tracking-widest' : ''
        }`}
      >
        {timeString}
      </h1>

      {/* Date & Day */}
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
