import React, { useState, useEffect, useRef } from 'react';
import { SearchConfig, SearchEngine } from '../../types';
import { Search, ChevronDown, Globe, Youtube, Github, ShieldAlert, Compass } from 'lucide-react';

interface SearchBarProps {
  config: SearchConfig;
  onUpdateEngine?: (engine: SearchEngine) => void;
}

const SEARCH_ENGINES: Record<SearchEngine, { name: string; url: string; icon: React.ReactNode }> = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: <Globe className="w-4 h-4 text-blue-400" /> },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: <ShieldAlert className="w-4 h-4 text-orange-400" /> },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: <Compass className="w-4 h-4 text-cyan-400" /> },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: <Globe className="w-4 h-4 text-purple-400" /> },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: <Youtube className="w-4 h-4 text-red-500" /> },
  github: { name: 'GitHub', url: 'https://github.com/search?q=', icon: <Github className="w-4 h-4 text-white" /> },
};

export const SearchBar: React.FC<SearchBarProps> = ({ config, onUpdateEngine }) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeEngine = SEARCH_ENGINES[config.engine] || SEARCH_ENGINES.google;

  // Shortcut key '/' focus listener
  useEffect(() => {
    if (!config.shortcutFocus) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an editable field or holding modifier keys
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.shortcutFocus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const isUrl = /^https?:\/\//i.test(query.trim()) || (query.includes('.') && !query.includes(' '));
    const targetUrl = isUrl
      ? query.startsWith('http')
        ? query.trim()
        : `https://${query.trim()}`
      : `${activeEngine.url}${encodeURIComponent(query.trim())}`;

    if (config.openInNewTab) {
      window.open(targetUrl, '_blank');
    } else {
      window.location.href = targetUrl;
    }
  };

  if (!config.enabled) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto z-20 my-4">
      <form onSubmit={handleSearch} className="relative flex items-center">
        {/* Engine dropdown selector button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-5 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-l-2xl border-y border-l border-white/15 backdrop-blur-md transition-all"
            title={`Active Engine: ${activeEngine.name}`}
          >
            {activeEngine.icon}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Engine Selector Popup Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-44 glass-panel rounded-xl py-1 shadow-2xl z-30 border border-white/15 animate-fade-in">
              {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((key) => {
                const engine = SEARCH_ENGINES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onUpdateEngine?.(key);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                      config.engine === key ? 'bg-white/15 font-semibold text-white' : 'text-white/80'
                    }`}
                  >
                    {engine.icon}
                    <span>{engine.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Input field */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder}
            className="w-full py-3.5 pl-4 pr-12 text-base text-white placeholder-white/50 bg-white/10 border-y border-r border-white/15 rounded-r-2xl backdrop-blur-xl focus:bg-white/15 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-glass"
          />
          <button
            type="submit"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Badge */}
        <div className="hidden sm:flex absolute right-12 top-1/2 -translate-y-1/2 items-center pointer-events-none pr-1">
          <kbd className="px-2 py-0.5 text-xs text-white/50 bg-white/10 border border-white/15 rounded-md font-mono">
            /
          </kbd>
        </div>
      </form>
    </div>
  );
};
