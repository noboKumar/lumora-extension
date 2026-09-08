import { useState, useEffect } from 'react';
import { WallpaperConfig } from '../types';
import { getCustomWallpaperMedia } from '../lib/indexed-db';

export const PRESET_WALLPAPERS = [
  {
    id: 'preset-ocean',
    name: 'Ocean Dusk',
    type: 'preset-image' as const,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop',
    category: 'nature' as const,
  },
  {
    id: 'preset-mountains',
    name: 'Alpine Mist',
    type: 'preset-image' as const,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop',
    category: 'nature' as const,
  },
  {
    id: 'preset-tokyo',
    name: 'Tokyo Cyber Neon',
    type: 'preset-image' as const,
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop',
    category: 'cyberpunk' as const,
  },
  {
    id: 'preset-aurora',
    name: 'Northern Aurora',
    type: 'preset-image' as const,
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=400&auto=format&fit=crop',
    category: 'space' as const,
  },
  {
    id: 'preset-abstract-glow',
    name: 'Cosmic Fluid',
    type: 'preset-image' as const,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    category: 'abstract' as const,
  },
  {
    id: 'preset-video-waterfall',
    name: 'Zen Waterfall (Video)',
    type: 'preset-video' as const,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=400&auto=format&fit=crop',
    category: 'nature' as const,
  },
  {
    id: 'preset-video-matrix',
    name: 'Cyber Matrix Rain (Video)',
    type: 'preset-video' as const,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-lights-42536-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop',
    category: 'cyberpunk' as const,
  },
  {
    id: 'preset-particles',
    name: 'Interactive Starlight (Canvas)',
    type: 'particles' as const,
    url: '',
    category: 'abstract' as const,
  },
  {
    id: 'preset-gradient',
    name: 'Deep Space Gradient',
    type: 'gradient' as const,
    url: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
    category: 'minimal' as const,
  },
];

export function useWallpaper(config: WallpaperConfig) {
  const [resolvedUrl, setResolvedUrl] = useState<string>(config.source);
  const [isVideo, setIsVideo] = useState<boolean>(config.type === 'preset-video');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    let createdObjectUrl: string | null = null;

    async function loadMedia() {
      setIsLoading(true);
      if (config.type === 'custom' && config.source) {
        try {
          const stored = await getCustomWallpaperMedia(config.source);
          if (active && stored && stored.blob) {
            createdObjectUrl = URL.createObjectURL(stored.blob);
            setResolvedUrl(createdObjectUrl);
            setIsVideo(stored.blob.type.startsWith('video/'));
          } else if (active) {
            setResolvedUrl(config.source);
            setIsVideo(false);
          }
        } catch {
          if (active) {
            setResolvedUrl(config.source);
            setIsVideo(false);
          }
        }
      } else {
        if (active) {
          setResolvedUrl(config.source);
          setIsVideo(config.type === 'preset-video');
        }
      }
      if (active) setIsLoading(false);
    }

    loadMedia();

    return () => {
      active = false;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [config.type, config.source]);

  return { resolvedUrl, isVideo, isLoading };
}
