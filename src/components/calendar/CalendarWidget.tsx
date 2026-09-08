import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarWidgetProps {
  enabled: boolean;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ enabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!enabled) return null;

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel p-3 rounded-2xl flex items-center gap-2 hover:bg-white/15 transition-all text-white/90 shadow-glass"
        title="Calendar"
      >
        <CalendarIcon className="w-5 h-5 text-sky-400" />
        <span className="text-xs font-semibold hidden md:inline">Calendar</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-4 shadow-2xl z-30 border border-white/20 animate-fade-in select-none">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <h4 className="text-sm font-semibold text-white">
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-white/50 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1.5" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (
                <div
                  key={dayNum}
                  className={`p-1.5 rounded-lg font-medium transition-all ${
                    isToday
                      ? 'bg-accent text-black font-bold shadow-glow scale-105'
                      : 'text-white/80 hover:bg-white/15'
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
