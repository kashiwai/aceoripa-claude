'use client';

import { useEffect, useRef, useState } from 'react';

interface SoundConfig {
  [key: string]: {
    url: string;
    volume: number;
    duration?: number;
  };
}

// 音声ファイルの設定
const soundConfig: SoundConfig = {
  'ssr-legendary': {
    url: '/sounds/ssr-legendary.mp3',
    volume: 0.8,
    duration: 8000
  },
  'sr-epic': {
    url: '/sounds/sr-epic.mp3', 
    volume: 0.7,
    duration: 5000
  },
  'r-rare': {
    url: '/sounds/r-rare.mp3',
    volume: 0.6,
    duration: 3000
  },
  'n-common': {
    url: '/sounds/n-common.mp3',
    volume: 0.5,
    duration: 2000
  },
  'coin-drop': {
    url: '/sounds/coin-drop.mp3',
    volume: 0.4,
    duration: 500
  },
  'chest-open': {
    url: '/sounds/chest-open.mp3',
    volume: 0.6,
    duration: 1000
  },
  'magic-sparkle': {
    url: '/sounds/magic-sparkle.mp3',
    volume: 0.5,
    duration: 2000
  }
};

export class SoundEffectManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isLoaded: boolean = false;
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async loadSounds() {
    if (!this.audioContext || this.isLoaded) return;

    // プレースホルダー音源を生成（実際の音声ファイルの代わり）
    for (const [key, config] of Object.entries(soundConfig)) {
      try {
        // 実際の音声ファイルの代わりに、周波数で音を生成
        const buffer = await this.createPlaceholderSound(key, config.duration || 1000);
        this.sounds.set(key, buffer);
      } catch (error) {
        console.warn(`音声ロード失敗: ${key}`, error);
      }
    }

    this.isLoaded = true;
  }

  // プレースホルダー音源の生成
  private async createPlaceholderSound(type: string, duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * (duration / 1000);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // レアリティに応じた音を生成
    switch (type) {
      case 'ssr-legendary':
        // 虹色っぽい複雑な和音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = 
            Math.sin(2 * Math.PI * 523.25 * t) * 0.2 + // C5
            Math.sin(2 * Math.PI * 659.25 * t) * 0.2 + // E5
            Math.sin(2 * Math.PI * 783.99 * t) * 0.2 + // G5
            Math.sin(2 * Math.PI * 1046.50 * t) * 0.1 + // C6
            Math.sin(2 * Math.PI * 1318.51 * t) * 0.1;  // E6
          
          // エンベロープ
          const envelope = Math.min(1, i / (sampleRate * 0.1)) * 
                          Math.max(0, 1 - (i - length * 0.7) / (length * 0.3));
          data[i] *= envelope * 0.5;
        }
        break;

      case 'sr-epic':
        // 力強い音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = 
            Math.sin(2 * Math.PI * 440 * t) * 0.3 + // A4
            Math.sin(2 * Math.PI * 554.37 * t) * 0.2 + // C#5
            Math.sin(2 * Math.PI * 659.25 * t) * 0.2;  // E5
          
          const envelope = Math.min(1, i / (sampleRate * 0.05)) * 
                          Math.exp(-i / (sampleRate * 2));
          data[i] *= envelope;
        }
        break;

      case 'r-rare':
        // 涼しげな音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = 
            Math.sin(2 * Math.PI * 493.88 * t) * 0.3 + // B4
            Math.sin(2 * Math.PI * 587.33 * t) * 0.2;  // D5
          
          const envelope = Math.exp(-i / (sampleRate * 1.5));
          data[i] *= envelope;
        }
        break;

      case 'n-common':
        // シンプルな音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = Math.sin(2 * Math.PI * 440 * t) * 0.3;
          
          const envelope = Math.exp(-i / (sampleRate * 1));
          data[i] *= envelope;
        }
        break;

      case 'coin-drop':
        // コイン音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const freq = 2000 * Math.exp(-t * 3);
          data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10);
        }
        break;

      case 'chest-open':
        // 宝箱を開ける音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = (Math.random() - 0.5) * 0.3 * Math.exp(-t * 5) +
                   Math.sin(2 * Math.PI * 200 * t) * 0.2 * Math.exp(-t * 3);
        }
        break;

      case 'magic-sparkle':
        // キラキラ音
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const freq = 1000 + Math.sin(2 * Math.PI * 10 * t) * 500;
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.1 * 
                   Math.sin(2 * Math.PI * 50 * t);
        }
        break;

      default:
        // デフォルト音
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() - 0.5) * 0.1 * Math.exp(-i / (sampleRate * 0.5));
        }
    }

    return buffer;
  }

  async playSound(soundKey: string, volume: number = 1.0) {
    if (!this.audioContext || this.isMuted) return;

    // AudioContextの再開（ユーザーインタラクション後）
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const buffer = this.sounds.get(soundKey);
    if (!buffer) {
      console.warn(`音声が見つかりません: ${soundKey}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const config = soundConfig[soundKey];
    gainNode.gain.value = (config?.volume || 1) * volume * this.masterVolume;

    source.start(0);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.sounds.clear();
  }
}

// React Hook
export const useSoundEffects = () => {
  const managerRef = useRef<SoundEffectManager | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  useEffect(() => {
    managerRef.current = new SoundEffectManager();
    
    managerRef.current.loadSounds().then(() => {
      setIsReady(true);
    });

    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  const playSound = (soundKey: string, volume?: number) => {
    managerRef.current?.playSound(soundKey, volume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    managerRef.current?.setMuted(newMuted);
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    managerRef.current?.setMasterVolume(newVolume);
  };

  return {
    playSound,
    isReady,
    isMuted,
    toggleMute,
    volume,
    changeVolume
  };
};

// サウンドコントロールUI
export const SoundControl = () => {
  const { isMuted, toggleMute, volume, changeVolume, playSound } = useSoundEffects();

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={isMuted ? '音声をONにする' : '音声をOFFにする'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => changeVolume(Number(e.target.value) / 100)}
          className="w-24"
          disabled={isMuted}
        />
        
        <button
          onClick={() => playSound('magic-sparkle')}
          className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
        >
          テスト
        </button>
      </div>
    </div>
  );
};