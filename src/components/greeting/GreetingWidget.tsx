import React from 'react';
import { GreetingConfig } from '../../types';
import { getGreetingTime } from '../../lib/utils';

interface GreetingWidgetProps {
  config: GreetingConfig;
}

export const GreetingWidget: React.FC<GreetingWidgetProps> = ({ config }) => {
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
    <div className="text-xl md:text-2xl font-light text-white/90 tracking-wide drop-shadow-md select-none mt-1 mb-4">
      <span>{greetingText}</span>
      {namePart && <span className="font-medium text-white">{namePart}</span>}
      <span className="text-accent font-normal">.</span>
    </div>
  );
};
