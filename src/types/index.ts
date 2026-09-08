export type ThemeId = 'minimal' | 'glass' | 'cyberpunk' | 'developer' | 'nature';

export type WallpaperType = 'preset-image' | 'preset-video' | 'particles' | 'gradient' | 'custom';

export interface WallpaperItem {
  id: string;
  name: string;
  type: WallpaperType;
  url: string;
  thumbnail?: string;
  author?: string;
  creditUrl?: string;
  category?: 'nature' | 'minimal' | 'space' | 'abstract' | 'cyberpunk' | 'anime';
}

export interface WallpaperConfig {
  type: WallpaperType;
  source: string;
  presetId: string;
  brightness: number; // 0 - 200
  blur: number; // 0 - 50
  opacity: number; // 0 - 100
  saturation: number; // 0 - 200
  overlay: number; // 0 - 100 (dark overlay tint)
  playbackSpeed: number; // 0.5 - 2.0
  autoRotate: boolean;
  rotationInterval: number; // in minutes
  lastRotated?: number;
}

export interface ClockConfig {
  enabled: boolean;
  format: '12h' | '24h';
  showSeconds: boolean;
  showDate: boolean;
  showDay: boolean;
  style: 'classic' | 'modern' | 'minimal' | 'bold' | 'terminal';
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alignment: 'left' | 'center' | 'right';
}

export interface GreetingConfig {
  enabled: boolean;
  name: string;
  customText: string;
  showName: boolean;
}

export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'brave' | 'youtube' | 'github';

export interface SearchConfig {
  enabled: boolean;
  engine: SearchEngine;
  openInNewTab: boolean;
  placeholder: string;
  shortcutFocus: boolean;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface BookmarksConfig {
  enabled: boolean;
  mode: 'custom' | 'chrome';
  showIcons: boolean;
  maxItems: number;
}

export interface WidgetsConfig {
  weather: boolean;
  bookmarks: boolean;
  notes: boolean;
  quote: boolean;
  calendar: boolean;
  music: boolean;
}

export interface WeatherConfig {
  enabled: boolean;
  city: string;
  unit: 'c' | 'f';
  useGeolocation: boolean;
  apiKey?: string;
  lat?: number;
  lon?: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  todos?: TodoItem[];
  updatedAt: number;
  pinned?: boolean;
}

export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  category?: string;
}

export interface QuoteConfig {
  enabled: boolean;
  category: 'inspirational' | 'wisdom' | 'code' | 'minimal' | 'custom';
  refreshInterval: 'never' | 'hourly' | 'daily';
  customQuotes: QuoteItem[];
}

export interface MusicConfig {
  enabled: boolean;
  soundscape: 'rain' | 'waves' | 'forest' | 'cafe' | 'lofi' | 'none';
  volume: number; // 0 - 100
  isPlaying: boolean;
}

export interface LayoutConfig {
  mode: 'centered' | 'split' | 'minimal' | 'sidebar';
  widgetPositions: Record<string, { x: number; y: number; visible: boolean }>;
}

export interface UserSettings {
  theme: ThemeId;
  fontFamily: 'inter' | 'outfit' | 'space-grotesk' | 'fira-code';
  accentColor: string;
  cardBlur: 'none' | 'sm' | 'md' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  
  wallpaper: WallpaperConfig;
  clock: ClockConfig;
  greeting: GreetingConfig;
  search: SearchConfig;
  bookmarks: BookmarksConfig;
  quickLinks: QuickLink[];
  widgets: WidgetsConfig;
  weather: WeatherConfig;
  quote: QuoteConfig;
  music: MusicConfig;
  layout: LayoutConfig;
}
