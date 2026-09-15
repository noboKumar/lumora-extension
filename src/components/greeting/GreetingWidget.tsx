import React from 'react';
import { GreetingConfig } from '../../types';
import { getGreetingTime } from '../../lib/utils';
import { Edit3 } from 'lucide-react';

interface GreetingWidgetProps {
  config: GreetingConfig;
  onOpenSettings?: (tab?: 'appearance' | 'wallpaper' | 'clock' | 'search' | 'widgets' | 'weather' | 'data') => void;
}

export const GreetingWidget: React.FC<GreetingWidgetProps> = ({ config, onOpenSettings }) => {
  if (!config.enabled) return null;

  const timeOfDay = getGreetingTime();
  
  const defaultGreetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  };

  const greetingText = config.customText || defaultGreetings[timeOfDay];
  const namePart = config.showName && config.name ? `, ${config.name}` : '';

  return (
    <div className="group flex items-center justify-center gap-2 text-lg md:text-xl font-light text-white/90 tracking-wide drop-shadow-md select-none mt-0.5 mb-2">
      <div>
        <span>{greetingText}</span>
        {namePart && <span className="font-medium text-white">{namePart}</span>}
        <span className="text-accent font-normal">.</span>
      </div>

      {onOpenSettings && (
        <button
          onClick={() => onOpenSettings('clock')}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/15 backdrop-blur-md hover:scale-105"
          title="Change Name & Greeting Settings"
        >
          <Edit3 className="w-3.5 h-3.5 text-accent" />
        </button>
      )}
    </div>
  );
};
