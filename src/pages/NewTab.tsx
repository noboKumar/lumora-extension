import React, { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { NewTabLayout } from "../layouts/NewTabLayout";
import { WallpaperLayer } from "../components/wallpaper/WallpaperLayer";
import { ClockWidget } from "../components/clock/ClockWidget";
import { GreetingWidget } from "../components/greeting/GreetingWidget";
import { SearchBar } from "../components/search/SearchBar";
import { BookmarksWidget } from "../components/bookmarks/BookmarksWidget";
import { WeatherWidget } from "../components/weather/WeatherWidget";
import { NotesWidget } from "../components/notes/NotesWidget";
import { QuoteWidget } from "../components/quote/QuoteWidget";
import { CalendarWidget } from "../components/calendar/CalendarWidget";
import { MusicWidget } from "../components/music/MusicWidget";
import { SettingsDrawer } from "../components/settings/SettingsDrawer";
import { QuickLink, SearchEngine } from "../types";
import { Settings, Sparkles, Edit3 } from "lucide-react";

export const NewTab: React.FC = () => {
  const { settings, updateSettings, resetSettings, isLoaded } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "appearance" | "wallpaper" | "clock" | "search" | "widgets" | "weather" | "data"
  >("appearance");

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white/50 text-sm">
        <Sparkles className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        Loading Lumora...
      </div>
    );
  }

  const handleOpenSettings = (
    tab?: "appearance" | "wallpaper" | "clock" | "search" | "widgets" | "weather" | "data"
  ) => {
    if (tab) setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  // Quick Links handlers
  const handleAddQuickLink = (newLink: Omit<QuickLink, "id">) => {
    const link: QuickLink = { ...newLink, id: Date.now().toString() };
    updateSettings((prev) => ({
      ...prev,
      quickLinks: [...prev.quickLinks, link],
    }));
  };

  const handleDeleteQuickLink = (id: string) => {
    updateSettings((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((l) => l.id !== id),
    }));
  };

  const handleUpdateQuickLink = (updated: QuickLink) => {
    updateSettings((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.map((l) =>
        l.id === updated.id ? updated : l,
      ),
    }));
  };

  const handleUpdateEngine = (engine: SearchEngine) => {
    updateSettings((prev) => ({
      ...prev,
      search: { ...prev.search, engine },
    }));
  };

  const themeClass = `theme-${settings.theme}`;
  const fontClass =
    settings.fontFamily === "inter"
      ? "font-sans"
      : settings.fontFamily === "space-grotesk"
        ? "font-sans"
        : settings.fontFamily === "fira-code"
          ? "font-mono"
          : "font-sans";

  return (
    <NewTabLayout
      themeClass={themeClass}
      fontClass={fontClass}
      wallpaper={<WallpaperLayer config={settings.wallpaper} />}
      header={
        <>
          {/* Top Left Widgets (Music, Calendar, Notes) */}
          <div className="flex items-center gap-2">
            {settings.widgets.music && (
              <MusicWidget
                config={settings.music}
                onUpdateConfig={(up) =>
                  updateSettings((prev) => ({
                    ...prev,
                    music: { ...prev.music, ...up },
                  }))
                }
              />
            )}
            {settings.widgets.calendar && (
              <CalendarWidget enabled={settings.widgets.calendar} />
            )}
            {settings.widgets.notes && (
              <NotesWidget enabled={settings.widgets.notes} />
            )}
          </div>

          {/* Top Right Widgets (Weather) */}
          <div className="flex items-center gap-2">
            {settings.widgets.weather && (
              <WeatherWidget config={settings.weather} />
            )}
          </div>
        </>
      }
      main={
        <div className="w-full flex flex-col items-center justify-center animate-fade-in">
          {/* Clock with Quick Edit Button */}
          <ClockWidget
            config={settings.clock}
            onOpenSettings={handleOpenSettings}
          />

          {/* Greeting with Quick Edit Button */}
          <GreetingWidget
            config={settings.greeting}
            onOpenSettings={handleOpenSettings}
          />

          {/* Search Bar */}
          <SearchBar
            config={settings.search}
            onUpdateEngine={handleUpdateEngine}
          />

          {/* Quick Bookmarks Launch */}
          {settings.widgets.bookmarks && (
            <BookmarksWidget
              config={settings.bookmarks}
              quickLinks={settings.quickLinks}
              onAddQuickLink={handleAddQuickLink}
              onDeleteQuickLink={handleDeleteQuickLink}
              onUpdateQuickLink={handleUpdateQuickLink}
            />
          )}

          {/* Quote Widget */}
          {settings.widgets.quote && <QuoteWidget config={settings.quote} />}
        </div>
      }
      footer={
        <>
          <div className="text-xs text-white/40 font-medium flex items-center gap-2">
            <span>Lumora Dashboard</span>
            <button
              onClick={() => handleOpenSettings("wallpaper")}
              className="hover:text-white/80 transition-colors flex items-center gap-1 text-[11px]"
              title="Change Wallpaper"
            >
              <Edit3 className="w-3 h-3 text-accent" />
              <span>Change Wallpaper</span>
            </button>
          </div>

          {/* Settings Trigger Button */}
          <button
            onClick={() => handleOpenSettings("appearance")}
            className="flex items-center gap-2 px-3.5 py-2 glass-panel hover:bg-white/20 rounded-2xl text-xs font-semibold text-white/90 hover:text-white shadow-glass transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-accent" />
            <span>Settings</span>
          </button>
        </>
      }
      settingsModal={
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetSettings={resetSettings}
          initialTab={settingsTab}
        />
      }
    />
  );
};
