'use client';

import { useRef, useCallback, useEffect } from 'react';

interface EmotionalSoundSystemProps {
  rarity: 'SS' | 'S' | 'A' | 'B' | 'C';
  stage: 'anticipation' | 'tension' | 'climax' | 'revelation' | 'euphoria';
  enabled?: boolean;
  volume?: number;
}

// 感情に訴えるサウンドシステム
export const EmotionalSoundSystem = ({
  rarity,
  stage,
  enabled = true,
  volume = 0.7
}: EmotionalSoundSystemProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentSoundsRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // オーディオコンテキストの初期化
  useEffect(() => {
    if (!enabled) return;

    const initAudio = async () => {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    };

    initAudio();

    return () => {
      // クリーンアップ
      currentSoundsRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // 既に停止している場合は無視
        }
      });
      currentSoundsRef.current.clear();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled, volume]);

  // 心拍音の生成
  const createHeartbeat = useCallback((intensity: number = 1) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const envelopeGain = ctx.createGain();
    
    oscillator.connect(envelopeGain);
    envelopeGain.connect(gainNodeRef.current);

    // 心拍のような低音
    oscillator.frequency.setValueAtTime(40 * intensity, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.15);

    // エンベロープ（アタック、ディケイ）
    envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
    envelopeGain.gain.linearRampToValueAtTime(0.4 * intensity, ctx.currentTime + 0.05);
    envelopeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);

    currentSoundsRef.current.add(oscillator);
    oscillator.addEventListener('ended', () => {
      currentSoundsRef.current.delete(oscillator);
    });
  }, []);

  // 緊張感のあるドラムロール
  const createTensionRoll = useCallback((duration: number = 2) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    let rollInterval: NodeJS.Timeout;

    const createHit = () => {
      const oscillator = ctx.createOscillator();
      const noiseFilter = ctx.createBiquadFilter();
      const envelopeGain = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(80, ctx.currentTime);
      
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(10, ctx.currentTime);

      oscillator.connect(noiseFilter);
      noiseFilter.connect(envelopeGain);
      envelopeGain.connect(gainNodeRef.current!);

      envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
      envelopeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      envelopeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);

      currentSoundsRef.current.add(oscillator);
      oscillator.addEventListener('ended', () => {
        currentSoundsRef.current.delete(oscillator);
      });
    };

    // だんだん早くなるロール
    let interval = 200;
    const rollLoop = () => {
      createHit();
      interval = Math.max(20, interval * 0.9);
      rollInterval = setTimeout(rollLoop, interval);
    };

    rollLoop();

    // 指定時間後に停止
    setTimeout(() => {
      clearTimeout(rollInterval);
    }, duration * 1000);
  }, []);

  // 魔法のような輝く音
  const createSparkleSound = useCallback((count: number = 5) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const envelopeGain = ctx.createGain();
        const delayNode = ctx.createDelay();
        const feedbackGain = ctx.createGain();

        // 高音のベル音
        oscillator.frequency.setValueAtTime(800 + Math.random() * 1200, ctx.currentTime);
        oscillator.type = 'sine';

        // ディレイエフェクト
        delayNode.delayTime.setValueAtTime(0.1, ctx.currentTime);
        feedbackGain.gain.setValueAtTime(0.3, ctx.currentTime);

        oscillator.connect(envelopeGain);
        envelopeGain.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(gainNodeRef.current!);

        envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
        envelopeGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        envelopeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 2);

        currentSoundsRef.current.add(oscillator);
        oscillator.addEventListener('ended', () => {
          currentSoundsRef.current.delete(oscillator);
        });
      }, i * 100);
    }
  }, []);

  // 壮大なファンファーレ
  const createFanfare = useCallback((rarity: string) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    
    // レアリティに応じた音階
    const rarityNotes = {
      SS: [523.25, 659.25, 783.99, 1046.50, 1318.51], // C, E, G, C, E
      S: [440, 554.37, 659.25, 880, 1108.73],         // A, C#, E, A, C#
      A: [349.23, 440, 523.25, 698.46, 880],          // F, A, C, F, A
      B: [293.66, 369.99, 440, 587.33, 739.99],       // D, F#, A, D, F#
      C: [261.63, 329.63, 392, 523.25, 659.25]        // C, E, G, C, E
    };

    const notes = rarityNotes[rarity as keyof typeof rarityNotes] || rarityNotes.C;

    notes.forEach((frequency, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const envelopeGain = ctx.createGain();
        const reverbConvolver = ctx.createConvolver();

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = 'triangle';

        oscillator.connect(envelopeGain);
        envelopeGain.connect(reverbConvolver);
        reverbConvolver.connect(gainNodeRef.current!);

        envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
        envelopeGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
        envelopeGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
        envelopeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 2);

        currentSoundsRef.current.add(oscillator);
        oscillator.addEventListener('ended', () => {
          currentSoundsRef.current.delete(oscillator);
        });
      }, index * 200);
    });
  }, []);

  // 感動的なコード進行
  const createEmotionalChord = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    
    // 感動的なコード進行 (Am - F - C - G)
    const chordProgression = [
      [220, 261.63, 329.63],    // Am
      [174.61, 220, 261.63],    // F
      [130.81, 164.81, 196],    // C
      [98, 123.47, 146.83]      // G
    ];

    chordProgression.forEach((chord, chordIndex) => {
      setTimeout(() => {
        chord.forEach((frequency, noteIndex) => {
          const oscillator = ctx.createOscillator();
          const envelopeGain = ctx.createGain();

          oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
          oscillator.type = 'sine';

          oscillator.connect(envelopeGain);
          envelopeGain.connect(gainNodeRef.current!);

          envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
          envelopeGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
          envelopeGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1.5);
          envelopeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

          oscillator.start();
          oscillator.stop(ctx.currentTime + 2);

          currentSoundsRef.current.add(oscillator);
          oscillator.addEventListener('ended', () => {
            currentSoundsRef.current.delete(oscillator);
          });
        });
      }, chordIndex * 1500);
    });
  }, []);

  // ステージに応じたサウンド再生
  useEffect(() => {
    if (!enabled) return;

    switch (stage) {
      case 'anticipation':
        createHeartbeat(0.5);
        const heartbeatInterval = setInterval(() => createHeartbeat(0.6), 1000);
        setTimeout(() => clearInterval(heartbeatInterval), 1500);
        break;

      case 'tension':
        createTensionRoll(1);
        break;

      case 'climax':
        createTensionRoll(2);
        setTimeout(() => createSparkleSound(3), 1000);
        break;

      case 'revelation':
        createFanfare(rarity);
        setTimeout(() => createSparkleSound(rarity === 'SS' ? 10 : 5), 500);
        break;

      case 'euphoria':
        createEmotionalChord();
        setTimeout(() => createSparkleSound(8), 2000);
        break;
    }
  }, [stage, rarity, enabled, createHeartbeat, createTensionRoll, createSparkleSound, createFanfare, createEmotionalChord]);

  return null; // このコンポーネントは音のみを担当
};

// 使用例のためのフック
export const useEmotionalSound = () => {
  const soundSystemRef = useRef<{
    playHeartbeat: () => void;
    playTension: () => void;
    playSparkle: () => void;
    playFanfare: (rarity: string) => void;
    playEmotionalChord: () => void;
  } | null>(null);

  const playSound = useCallback((type: string, rarity?: string) => {
    switch (type) {
      case 'heartbeat':
        soundSystemRef.current?.playHeartbeat();
        break;
      case 'tension':
        soundSystemRef.current?.playTension();
        break;
      case 'sparkle':
        soundSystemRef.current?.playSparkle();
        break;
      case 'fanfare':
        soundSystemRef.current?.playFanfare(rarity || 'C');
        break;
      case 'emotional':
        soundSystemRef.current?.playEmotionalChord();
        break;
    }
  }, []);

  return { playSound };
};