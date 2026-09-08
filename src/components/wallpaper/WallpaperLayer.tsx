import React, { useRef, useEffect } from 'react';
import { WallpaperConfig } from '../../types';
import { useWallpaper } from '../../hooks/useWallpaper';
import { CanvasParticles } from './CanvasParticles';

interface WallpaperLayerProps {
  config: WallpaperConfig;
}

export const WallpaperLayer: React.FC<WallpaperLayerProps> = ({ config }) => {
  const { resolvedUrl, isVideo } = useWallpaper(config);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = config.playbackSpeed || 1.0;
    }
  }, [config.playbackSpeed, resolvedUrl]);

  const filterStyle: React.CSSProperties = {
    filter: `brightness(${config.brightness}%) blur(${config.blur}px) saturate(${config.saturation}%)`,
    opacity: config.opacity / 100,
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-black">
      {/* Dark tint overlay layer */}
      <div
        className="absolute inset-0 z-10 transition-opacity duration-300"
        style={{ backgroundColor: `rgba(0, 0, 0, ${config.overlay / 100})` }}
      />

      {/* Particles */}
      {config.type === 'particles' && (
        <div style={filterStyle} className="w-full h-full">
          <CanvasParticles />
        </div>
      )}

      {/* CSS Gradient */}
      {config.type === 'gradient' && (
        <div
          className="w-full h-full transition-all duration-700"
          style={{
            background: config.source || 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
            ...filterStyle,
          }}
        />
      )}

      {/* Video Wallpaper */}
      {isVideo && resolvedUrl && (
        <video
          ref={videoRef}
          key={resolvedUrl}
          src={resolvedUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="w-full h-full object-cover transition-all duration-500"
          style={filterStyle}
          onError={(e) => {
            console.warn('Video wallpaper failed to load:', resolvedUrl, e);
          }}
        />
      )}

      {/* Static Image Wallpaper */}
      {!isVideo && config.type !== 'particles' && config.type !== 'gradient' && resolvedUrl && (
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url("${resolvedUrl}")`,
            ...filterStyle,
          }}
        />
      )}
    </div>
  );
};
