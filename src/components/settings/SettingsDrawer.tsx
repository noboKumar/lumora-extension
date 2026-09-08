import React, { useState } from 'react';
import { UserSettings, ThemeId, SearchEngine, WallpaperType } from '../../types';
import { PRESET_WALLPAPERS } from '../../hooks/useWallpaper';
import { saveCustomWallpaperMedia } from '../../lib/indexed-db';
import {
  X, Palette, Image, Clock, Search, LayoutGrid, CloudSun, Database,
  Upload, RotateCcw, Download, Check, Sliders, Volume2
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  onResetSettings: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'wallpaper' | 'clock' | 'search' | 'widgets' | 'weather' | 'data'
  >('appearance');

  const [uploadLoading, setUploadLoading] = useState(false);

  if (!isOpen) return null;

  // Custom Wallpaper Upload Handler (IndexedDB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const mediaId = `custom_${Date.now()}`;

      await saveCustomWallpaperMedia({
        id: mediaId,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        blob: file,
        mimeType: file.type,
        createdAt: Date.now(),
      });

      onUpdateSettings((prev) => ({
        ...prev,
        wallpaper: {
          ...prev.wallpaper,
          type: 'custom',
          source: mediaId,
          presetId: 'custom',
        },
      }));
    } catch (err) {
      console.error('Failed to upload custom wallpaper', err);
      alert('Failed to save uploaded media file.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Export JSON Settings
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lumora-settings-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Settings
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onUpdateSettings(imported);
        alert('Settings imported successfully!');
      } catch {
        alert('Invalid JSON settings file.');
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'wallpaper', label: 'Wallpaper', icon: <Image className="w-4 h-4" /> },
    { id: 'clock', label: 'Clock & Greeting', icon: <Clock className="w-4 h-4" /> },
    { id: 'search', label: 'Search Engine', icon: <Search className="w-4 h-4" /> },
    { id: 'widgets', label: 'Widgets Toggle', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Backup', icon: <Database className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl h-full glass-panel border-l border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent" />
              <span>Lumora Settings</span>
            </h2>
            <p className="text-xs text-white/60">Customize your New Tab dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-44 border-r border-white/10 p-3 space-y-1 bg-black/20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-accent/20 text-white font-semibold border border-accent/40 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. APPEARANCE & THEME */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Theme Preset</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      [
                        { id: 'glass', name: 'Glassmorphism', desc: 'Modern transparent blur' },
                        { id: 'minimal', name: 'Minimalist', desc: 'Clean low-contrast look' },
                        { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Futuristic neon pink' },
                        { id: 'developer', name: 'Developer', desc: 'Terminal matrix green' },
                        { id: 'nature', name: 'Nature Zen', desc: 'Calming emerald green' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onUpdateSettings({ theme: t.id })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          settings.theme === t.id
                            ? 'bg-accent/20 border-accent text-white shadow-glow'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.name}</div>
                        <div className="text-[10px] text-white/50">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Typography Font</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'outfit', label: 'Outfit (Modern)' },
                        { id: 'inter', label: 'Inter (Clean)' },
                        { id: 'space-grotesk', label: 'Space Grotesk' },
                        { id: 'fira-code', label: 'Fira Code (Mono)' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ fontFamily: f.id })}
                        className={`px-3 py-2 text-xs rounded-xl border transition-all ${
                          settings.fontFamily === f.id
                            ? 'bg-accent/20 border-accent text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. WALLPAPER */}
            {activeTab === 'wallpaper' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Curated Wallpapers</h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRESET_WALLPAPERS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            wallpaper: {
                              ...prev.wallpaper,
                              type: preset.type,
                              source: preset.url,
                              presetId: preset.id,
                            },
                          }))
                        }
                        className={`relative h-20 rounded-xl overflow-hidden border transition-all group ${
                          settings.wallpaper.presetId === preset.id
                            ? 'border-accent ring-2 ring-accent/40 shadow-glow'
                            : 'border-white/10 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {preset.type === 'particles' ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-accent">
                            Canvas Starlight
                          </div>
                        ) : preset.type === 'gradient' ? (
                          <div className="w-full h-full bg-gradient-to-r from-slate-900 to-indigo-950" />
                        ) : (
                          <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-medium truncate">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom File Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Upload Custom Wallpaper</h3>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-white/80">
                      {uploadLoading ? 'Saving media...' : 'Choose Image or Video (JPG, PNG, WebM, MP4)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Filters Sliders */}
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white">Wallpaper Controls & Filters</h3>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                      <span>Brightness</span>
                      <span>{settings.wallpaper.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={settings.wallpaper.brightness}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          wallpaper: { ...prev.wallpaper, brightness: Number(e.target.value) },
                        }))
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                      <span>Blur Effect</span>
                      <span>{settings.wallpaper.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={settings.wallpaper.blur}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          wallpaper: { ...prev.wallpaper, blur: Number(e.target.value) },
                        }))
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                      <span>Dark Overlay Tint</span>
                      <span>{settings.wallpaper.overlay}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={settings.wallpaper.overlay}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          wallpaper: { ...prev.wallpaper, overlay: Number(e.target.value) },
                        }))
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CLOCK & GREETING */}
            {activeTab === 'clock' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Clock Format & Style</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          clock: { ...prev.clock, format: '12h' },
                        }))
                      }
                      className={`p-2.5 text-xs rounded-xl border font-semibold ${
                        settings.clock.format === '12h' ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      12-Hour (AM/PM)
                    </button>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          clock: { ...prev.clock, format: '24h' },
                        }))
                      }
                      className={`p-2.5 text-xs rounded-xl border font-semibold ${
                        settings.clock.format === '24h' ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      24-Hour
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                    <span>Show Seconds</span>
                    <input
                      type="checkbox"
                      checked={settings.clock.showSeconds}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          clock: { ...prev.clock, showSeconds: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                    <span>Show Date</span>
                    <input
                      type="checkbox"
                      checked={settings.clock.showDate}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          clock: { ...prev.clock, showDate: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-0"
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Greeting Customization</h3>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={settings.greeting.name}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          greeting: { ...prev.greeting, name: e.target.value },
                        }))
                      }
                      placeholder="e.g. Explorer"
                      className="w-full px-3.5 py-2 rounded-xl text-xs text-white bg-white/10 border border-white/15 focus:border-accent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. SEARCH ENGINE */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Default Search Engine</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'google', label: 'Google' },
                        { id: 'duckduckgo', label: 'DuckDuckGo' },
                        { id: 'bing', label: 'Bing' },
                        { id: 'brave', label: 'Brave' },
                        { id: 'youtube', label: 'YouTube' },
                        { id: 'github', label: 'GitHub' },
                      ] as const
                    ).map((se) => (
                      <button
                        key={se.id}
                        onClick={() =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            search: { ...prev.search, engine: se.id },
                          }))
                        }
                        className={`px-3 py-2 text-xs rounded-xl border transition-all text-left font-medium ${
                          settings.search.engine === se.id
                            ? 'bg-accent/20 border-accent text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {se.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10">
                  <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                    <span>Press '/' key to focus search bar</span>
                    <input
                      type="checkbox"
                      checked={settings.search.shortcutFocus}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          search: { ...prev.search, shortcutFocus: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 5. WIDGETS TOGGLE */}
            {activeTab === 'widgets' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white mb-2">Enabled Dashboard Widgets</h3>
                {(
                  [
                    { key: 'weather', label: 'Weather Card' },
                    { key: 'bookmarks', label: 'Bookmarks & Quick Launch' },
                    { key: 'notes', label: 'Quick Notes & Tasks' },
                    { key: 'quote', label: 'Daily Inspiration Quote' },
                    { key: 'calendar', label: 'Calendar Preview' },
                    { key: 'music', label: 'Ambient Audio Player' },
                  ] as const
                ).map((w) => (
                  <label
                    key={w.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-medium text-white">{w.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.widgets[w.key]}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          widgets: { ...prev.widgets, [w.key]: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-0"
                    />
                  </label>
                ))}
              </div>
            )}

            {/* 6. WEATHER */}
            {activeTab === 'weather' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">City Name</label>
                  <input
                    type="text"
                    value={settings.weather.city}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        weather: { ...prev.weather, city: e.target.value },
                      }))
                    }
                    placeholder="e.g. Dhaka, London, Tokyo"
                    className="w-full px-3.5 py-2 rounded-xl text-xs text-white bg-white/10 border border-white/15 focus:border-accent outline-none"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-medium text-white/70 mb-2">Temperature Unit</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          weather: { ...prev.weather, unit: 'c' },
                        }))
                      }
                      className={`px-4 py-2 text-xs rounded-xl border font-semibold ${
                        settings.weather.unit === 'c' ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          weather: { ...prev.weather, unit: 'f' },
                        }))
                      }
                      className={`px-4 py-2 text-xs rounded-xl border font-semibold ${
                        settings.weather.unit === 'f' ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. DATA & BACKUP */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white mb-2">Data Backup & Restore</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-accent" />
                    <span>Export JSON</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white cursor-pointer transition-all shadow-sm">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Import JSON</span>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        onResetSettings();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Settings to Factory Default</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
