# Lumora — Aesthetic Chrome New Tab Extension & Dashboard

**Lumora** is a production-quality, aesthetic, minimal personal dashboard extension that replaces Chrome's default New Tab page. Built with React 18, TypeScript, Tailwind CSS, and Framer Motion under Chrome Extension Manifest V3.

---

## ✨ Features

- 🌌 **Wallpaper-First Experience**:
  - High-res static images (Ocean, Alpine Mist, Tokyo Neon, Northern Aurora, Cosmic Fluid).
  - Live video wallpapers (Zen Waterfall, Matrix Cyber Rain with playback speed controls).
  - Interactive Canvas Starlight particle generator with cursor reactive motion.
  - Deep cosmic gradients.
  - Custom file uploader (Image/Video saved locally in **IndexedDB**).
  - Adjustable Brightness, Blur, Opacity, Saturation, and Dark Overlay Tint.

- ⏰ **Customizable Clock & Date**:
  - 12-hour (AM/PM) and 24-hour format support.
  - Optional seconds, day, and date toggles.
  - Multiple styles (*Classic, Modern, Minimal, Bold, Terminal*).

- 👋 **Dynamic Greetings**:
  - Time-based greetings (*Good morning, Good afternoon, Good evening, Good night*).
  - Custom user name and text override.

- 🔍 **Multi-Engine Search**:
  - Configurable search engines (*Google, DuckDuckGo, Bing, Brave, YouTube, GitHub*).
  - `/` keyboard shortcut to immediately focus search bar.
  - Open in current tab or new tab option.

- 🔖 **Bookmarks & Quick Launch**:
  - Customizable grid cards with automatic domain favicons.
  - Add, edit, and delete quick launch links.
  - Integrated Chrome Bookmarks Tree explorer (`chrome.bookmarks` API).

- ☀️ **Weather Widget**:
  - Powered by **Open-Meteo free API** (no API key required).
  - Automatic geolocation or custom city lookup.
  - Real-time condition icons, humidity, wind speed, feels-like, and high/low ranges.

- 📝 **Quick Notes & Tasks**:
  - Interactive checkable todo items and scratchpad.
  - Auto-saved to persistent local storage.

- 💡 **Daily Quotes**:
  - Curated inspirational quotes collection with instant refresh.

- 📅 **Calendar Preview**:
  - Minimal month view with today highlight and date navigation.

- 🎵 **Ambient Audio Player**:
  - Web Audio synthesized relaxing soundscapes (*Gentle Rain, Ocean Waves, Quiet Forest, Cozy Cafe, Pink Noise*).

- 🎨 **Theme Engine**:
  - 5 handcrafted themes (*Glassmorphism, Minimalist, Cyberpunk, Developer, Nature Zen*).

- 💾 **Data Management**:
  - Complete JSON Settings Backup & Restore.
  - Factory settings reset.

---

## 🛠️ Architecture & Tech Stack

- **Extension Framework**: Manifest V3 (`chrome_url_overrides.newtab`)
- **Frontend Stack**: React 18, TypeScript (Strict), Tailwind CSS
- **Icons & Animation**: Lucide React, Framer Motion
- **Storage Layer**: Unified `chrome.storage.local` adapter with `localStorage` dev fallback + `IndexedDB` for high-res custom wallpapers.

---

## 🚀 Installation & Loading into Chrome

### 1. Build the Extension
```bash
npm install
npm run build
```

This generates the unpacked Chrome Extension in the `dist/` directory.

### 2. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `dist/` folder inside this project repository.
5. Open a **New Tab** (`Ctrl + T` or `Cmd + T`) to experience Lumora!

---

## 📜 Development Scripts

- `npm run dev`: Launch Vite local dev server with HMR.
- `npm run build`: Build production extension into `dist/`.
- `npm run typecheck`: Perform strict TypeScript type checking.
- `npm run preview`: Preview production build locally.
