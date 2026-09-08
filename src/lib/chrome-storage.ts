import { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'glass',
  fontFamily: 'outfit',
  accentColor: '#38bdf8',
  cardBlur: 'md',
  borderRadius: 'md',
  
  wallpaper: {
    type: 'preset-image',
    source: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop',
    presetId: 'preset-ocean',
    brightness: 85,
    blur: 0,
    opacity: 100,
    saturation: 105,
    overlay: 25,
    playbackSpeed: 1.0,
    autoRotate: false,
    rotationInterval: 60,
  },
  
  clock: {
    enabled: true,
    format: '12h',
    showSeconds: false,
    showDate: true,
    showDay: true,
    style: 'modern',
    fontSize: 'xl',
    alignment: 'center',
  },
  
  greeting: {
    enabled: true,
    name: 'Explorer',
    customText: '',
    showName: true,
  },
  
  search: {
    enabled: true,
    engine: 'google',
    openInNewTab: false,
    placeholder: 'Search the web or type a URL...',
    shortcutFocus: true,
  },
  
  bookmarks: {
    enabled: true,
    mode: 'custom',
    showIcons: true,
    maxItems: 12,
  },
  
  quickLinks: [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: 'github', category: 'Dev' },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', icon: 'youtube', category: 'Media' },
    { id: '3', title: 'Gmail', url: 'https://mail.google.com', icon: 'mail', category: 'Work' },
    { id: '4', title: 'Figma', url: 'https://figma.com', icon: 'figma', category: 'Design' },
    { id: '5', title: 'ChatGPT', url: 'https://chatgpt.com', icon: 'bot', category: 'AI' },
    { id: '6', title: 'Reddit', url: 'https://reddit.com', icon: 'message-square', category: 'Social' },
  ],
  
  widgets: {
    weather: true,
    bookmarks: true,
    notes: true,
    quote: true,
    calendar: true,
    music: true,
  },
  
  weather: {
    enabled: true,
    city: 'Dhaka',
    unit: 'c',
    useGeolocation: true,
  },
  
  quote: {
    enabled: true,
    category: 'inspirational',
    refreshInterval: 'daily',
    customQuotes: [],
  },
  
  music: {
    enabled: true,
    soundscape: 'none',
    volume: 50,
    isPlaying: false,
  },
  
  layout: {
    mode: 'centered',
    widgetPositions: {},
  },
};

const STORAGE_KEY = 'lumora_user_settings';

// Helper to check Chrome Extension context
export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
};

// Get settings synchronously/asynchronously
export const getSettings = async (): Promise<UserSettings> => {
  try {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (result && result[STORAGE_KEY]) {
            resolve({ ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] });
          } else {
            resolve(DEFAULT_SETTINGS);
          }
        });
      });
    } else {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
      }
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.warn('Failed to read settings from storage, using defaults', err);
    return DEFAULT_SETTINGS;
  }
};

// Save settings
export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
          resolve();
        });
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (err) {
    console.error('Failed to save settings', err);
  }
};

// Event listener mechanism for cross-tab or component sync
type StorageChangeListener = (newSettings: UserSettings) => void;
const listeners: Set<StorageChangeListener> = new Set();

export const subscribeToSettings = (listener: StorageChangeListener): (() => void) => {
  listeners.add(listener);

  if (isChromeExtension()) {
    const handleChromeChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        listener({ ...DEFAULT_SETTINGS, ...changes[STORAGE_KEY].newValue });
      }
    };
    chrome.storage.onChanged.addListener(handleChromeChange);

    return () => {
      listeners.delete(listener);
      chrome.storage.onChanged.removeListener(handleChromeChange);
    };
  } else {
    const handleWindowStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        listener({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
      }
    };
    window.addEventListener('storage', handleWindowStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleWindowStorage);
    };
  }
};

export const notifySettingsChanged = (newSettings: UserSettings) => {
  listeners.forEach((l) => l(newSettings));
};
