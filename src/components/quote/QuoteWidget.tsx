import React, { useState } from 'react';
import { QuoteConfig } from '../../types';
import { RefreshCw, Quote } from 'lucide-react';

interface QuoteWidgetProps {
  config: QuoteConfig;
}

const DEFAULT_QUOTES = [
  { quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { quote: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { quote: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { quote: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs' },
  { quote: 'Code is like humor. When you have to explain it, it’s bad.', author: 'Cory House' },
  { quote: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
  { quote: 'Creativity is intelligence having fun.', author: 'Albert Einstein' },
];

export const QuoteWidget: React.FC<QuoteWidgetProps> = ({ config }) => {
  const [index, setIndex] = useState(0);

  if (!config.enabled) return null;

  const current = DEFAULT_QUOTES[index % DEFAULT_QUOTES.length];

  const handleNextQuote = () => {
    setIndex((prev) => (prev + 1) % DEFAULT_QUOTES.length);
  };

  return (
    <div className="relative z-10 max-w-xl mx-auto my-4 text-center">
      <div className="glass-panel inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md shadow-glass group hover:bg-white/15 transition-all">
        <Quote className="w-4 h-4 text-accent shrink-0 opacity-70" />
        <p className="text-xs md:text-sm italic text-white/90 font-light">
          "{current.quote}"
          <span className="not-italic font-medium text-white/60 ml-2">— {current.author}</span>
        </p>
        <button
          onClick={handleNextQuote}
          className="p-1 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
          title="New Quote"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
