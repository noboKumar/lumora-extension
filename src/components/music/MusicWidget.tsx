import React, { useState, useEffect, useRef } from 'react';
import { MusicConfig } from '../../types';
import { Volume2, VolumeX, Play, Pause, Music, X } from 'lucide-react';

interface MusicWidgetProps {
  config: MusicConfig;
  onUpdateConfig: (updated: Partial<MusicConfig>) => void;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({ config, onUpdateConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const soundscapes = [
    { id: 'rain', name: 'Gentle Rain' },
    { id: 'waves', name: 'Ocean Waves' },
    { id: 'forest', name: 'Quiet Forest' },
    { id: 'cafe', name: 'Cozy Cafe' },
    { id: 'lofi', name: 'Pink Noise' },
  ] as const;

  // Web Audio Synth Generator for Ambient Soundscapes
  const startAmbientSynth = (type: string) => {
    stopAmbientSynth();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = (config.volume / 100) * 0.15;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // Create pink/white noise buffer for rain/waves
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter for ambient sound frequency spectrum
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.value = 400;
      } else if (type === 'forest') {
        filter.type = 'highpass';
        filter.frequency.value = 800;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
      }

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      sourceNodeRef.current = noise;
    } catch (err) {
      console.warn('Audio Context init failed', err);
    }
  };

  const stopAmbientSynth = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    if (config.isPlaying && config.soundscape !== 'none') {
      startAmbientSynth(config.soundscape);
    } else {
      stopAmbientSynth();
    }
    return () => stopAmbientSynth();
  }, [config.isPlaying, config.soundscape]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.value = (config.volume / 100) * 0.15;
    }
  }, [config.volume]);

  if (!config.enabled) return null;

  const togglePlay = () => {
    if (!config.isPlaying && config.soundscape === 'none') {
      onUpdateConfig({ soundscape: 'rain', isPlaying: true });
    } else {
      onUpdateConfig({ isPlaying: !config.isPlaying });
    }
  };

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-panel p-3 rounded-2xl flex items-center gap-2 hover:bg-white/15 transition-all shadow-glass ${
          config.isPlaying ? 'text-accent font-semibold' : 'text-white/90'
        }`}
        title="Ambient Soundscapes"
      >
        <Music className={`w-5 h-5 ${config.isPlaying ? 'animate-pulse text-accent' : 'text-purple-400'}`} />
        <span className="text-xs font-semibold hidden md:inline">
          {config.isPlaying ? 'Playing' : 'Audio'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-4 shadow-2xl z-30 border border-white/20 animate-fade-in select-none">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <h4 className="text-sm font-semibold text-white">Ambient Soundscapes</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 mb-4 bg-white/5 p-3 rounded-xl">
            <button
              onClick={togglePlay}
              className="p-2.5 bg-accent hover:bg-accent/90 text-black rounded-full shadow-glow transition-all"
            >
              {config.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 flex items-center gap-2">
              {config.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/80" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={config.volume}
                onChange={(e) => onUpdateConfig({ volume: Number(e.target.value) })}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* Soundscape List */}
          <div className="space-y-1">
            {soundscapes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onUpdateConfig({ soundscape: s.id, isPlaying: true });
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                  config.soundscape === s.id && config.isPlaying
                    ? 'bg-accent/20 text-accent font-semibold border border-accent/40'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{s.name}</span>
                {config.soundscape === s.id && config.isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
