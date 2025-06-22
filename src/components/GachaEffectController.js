/**
 * GachaEffectController - 統合ガチャエフェクトコントローラー
 * バナー、動画、音声を統合してガチャ演出を制御
 */

import { useEffect, useRef, useState } from 'react';

class GachaEffectController {
  constructor() {
    this.audioContext = null;
    this.bgmSource = null;
    this.isPlaying = false;
    this.onComplete = null;
  }

  /**
   * 初期化
   */
  async init() {
    // Web Audio APIの初期化
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // アセットのプリロード
    await this.preloadAssets();
  }

  /**
   * アセットのプリロード
   */
  async preloadAssets() {
    const assets = {
      // BGM
      bgm: [
        '/audio/bgm/epic-gacha-bgm.mp3',
        '/audio/bgm/tension-buildup.mp3'
      ],
      // 効果音
      sfx: {
        click: '/audio/sfx/button-click.mp3',
        spin: '/audio/sfx/gacha-spin.mp3',
        explosion: '/audio/sfx/explosion.mp3',
        sparkle: '/audio/sfx/sparkle.mp3',
        rarityReveal: {
          N: '/audio/sfx/normal-reveal.mp3',
          R: '/audio/sfx/rare-reveal.mp3',
          SR: '/audio/sfx/super-rare-reveal.mp3',
          SSR: '/audio/sfx/ssr-reveal.mp3',
          UR: '/audio/sfx/ur-reveal.mp3',
          PSA10: '/audio/sfx/psa10-reveal.mp3'
        }
      },
      // バナー画像
      banners: {
        N: '/images/banners/1024x1024/normal-banner.png',
        R: '/images/banners/1024x1024/rare-banner.png',
        SR: '/images/banners/1024x1024/super-rare-banner.png',
        SSR: '/images/banners/1024x1024/ssr-banner.png',
        UR: '/images/banners/1024x1024/ur-banner.png',
        PSA10: '/images/banners/1024x1024/psa10-banner.png'
      }
    };

    // プリロード実行
    const promises = [];
    
    // 音声ファイルのプリロード
    [...assets.bgm, ...Object.values(assets.sfx)].forEach(url => {
      if (typeof url === 'string') {
        promises.push(this.loadAudio(url));
      }
    });
    
    Object.values(assets.sfx.rarityReveal).forEach(url => {
      promises.push(this.loadAudio(url));
    });

    // 画像のプリロード
    Object.values(assets.banners).forEach(url => {
      promises.push(this.loadImage(url));
    });

    await Promise.all(promises);
    this.assets = assets;
  }

  /**
   * 音声ファイルの読み込み
   */
  async loadAudio(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return { url, buffer: audioBuffer };
    } catch (error) {
      console.warn(`Failed to load audio: ${url}`, error);
      return null;
    }
  }

  /**
   * 画像の読み込み
   */
  loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, img });
      img.onerror = () => {
        console.warn(`Failed to load image: ${url}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * ガチャエフェクトの実行
   */
  async playGachaEffect(type = 'single', results = []) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    try {
      // 1. ボタンクリック音
      await this.playSound(this.assets.sfx.click);
      
      // 2. BGM開始
      this.startBGM();
      
      // 3. ガチャ回転演出
      await this.playSpinAnimation(type);
      
      // 4. 結果表示
      for (let i = 0; i < results.length; i++) {
        await this.revealCard(results[i], i, results.length);
      }
      
      // 5. 完了処理
      this.stopBGM();
      this.isPlaying = false;
      
      if (this.onComplete) {
        this.onComplete(results);
      }
      
    } catch (error) {
      console.error('Gacha effect error:', error);
      this.isPlaying = false;
      this.stopBGM();
    }
  }

  /**
   * 回転アニメーション
   */
  async playSpinAnimation(type) {
    const duration = type === 'single' ? 3000 : 5000;
    
    // スピン音再生
    await this.playSound(this.assets.sfx.spin);
    
    // Canvas要素の作成
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    canvas.style.position = 'fixed';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const startTime = Date.now();
    
    // アニメーションループ
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 背景エフェクト
      this.drawSpinBackground(ctx, progress);
      
      // ガチャマシンアニメーション
      this.drawGachaMachine(ctx, progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // クリーンアップ
        setTimeout(() => {
          document.body.removeChild(canvas);
        }, 100);
      }
    };
    
    animate();
    
    // アニメーション完了まで待機
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * カード公開演出
   */
  async revealCard(card, index, total) {
    const { rarity, image } = card;
    
    // レアリティに応じた演出時間
    const revealDuration = {
      N: 1000,
      R: 1500,
      SR: 2000,
      SSR: 3000,
      UR: 4000,
      PSA10: 5000
    }[rarity] || 1000;
    
    // 爆発音
    await this.playSound(this.assets.sfx.explosion);
    
    // レアリティ専用効果音
    if (this.assets.sfx.rarityReveal[rarity]) {
      await this.playSound(this.assets.sfx.rarityReveal[rarity]);
    }
    
    // カード表示演出
    const cardElement = this.createCardRevealElement(card, index, total);
    document.body.appendChild(cardElement);
    
    // エフェクトアニメーション
    await this.playCardRevealEffect(cardElement, rarity, revealDuration);
    
    // 少し表示を維持
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // クリーンアップ
    cardElement.remove();
  }

  /**
   * カード公開要素の作成
   */
  createCardRevealElement(card, index, total) {
    const container = document.createElement('div');
    container.className = 'gacha-card-reveal';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      width: 400px;
      height: 560px;
      perspective: 1000px;
    `;
    
    // カード本体
    const cardEl = document.createElement('div');
    cardEl.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      animation: cardFlip 1s ease-out forwards;
    `;
    
    // カード画像
    const img = document.createElement('img');
    img.src = card.image;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    
    // レアリティバッジ
    const rarityBadge = document.createElement('img');
    rarityBadge.src = `/images/rarity-icons/${card.rarity.toLowerCase()}-icon.png`;
    rarityBadge.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 80px;
      height: 80px;
      animation: pulse 1s infinite;
    `;
    
    cardEl.appendChild(img);
    cardEl.appendChild(rarityBadge);
    container.appendChild(cardEl);
    
    // エフェクト要素追加
    this.addRarityEffects(container, card.rarity);
    
    return container;
  }

  /**
   * レアリティ別エフェクト追加
   */
  addRarityEffects(container, rarity) {
    const effects = {
      N: { particles: 10, color: '#888888' },
      R: { particles: 20, color: '#4ECDC4' },
      SR: { particles: 30, color: '#FFD93D' },
      SSR: { particles: 50, color: '#FF6B6B' },
      UR: { particles: 80, color: '#DA70D6' },
      PSA10: { particles: 100, color: '#FFD700' }
    };
    
    const config = effects[rarity] || effects.N;
    
    // パーティクルエフェクト
    for (let i = 0; i < config.particles; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${config.color};
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        animation: particle-${i} 2s ease-out forwards;
      `;
      
      // ランダムな動きのアニメーション
      const angle = (Math.PI * 2 * i) / config.particles;
      const distance = 100 + Math.random() * 200;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes particle-${i} {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      container.appendChild(particle);
    }
  }

  /**
   * 音声再生
   */
  async playSound(url, volume = 1.0) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      
      return new Promise(resolve => {
        source.onended = resolve;
      });
    } catch (error) {
      console.warn('Failed to play sound:', url, error);
    }
  }

  /**
   * BGM開始
   */
  startBGM() {
    // BGMの実装（簡略化）
    this.playSound(this.assets.bgm[0], 0.3);
  }

  /**
   * BGM停止
   */
  stopBGM() {
    if (this.bgmSource) {
      this.bgmSource.stop();
      this.bgmSource = null;
    }
  }

  /**
   * スピン背景描画
   */
  drawSpinBackground(ctx, progress) {
    // 回転する背景パターン
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(progress * Math.PI * 4);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 512);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${1 - progress})`);
    gradient.addColorStop(0.5, `rgba(255, 107, 107, ${0.5 - progress * 0.5})`);
    gradient.addColorStop(1, `rgba(78, 205, 196, ${0.3 - progress * 0.3})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-512, -512, 1024, 1024);
    ctx.restore();
  }

  /**
   * ガチャマシン描画
   */
  drawGachaMachine(ctx, progress) {
    // シンプルなガチャマシン表現
    ctx.save();
    ctx.translate(512, 512);
    
    // 本体
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(-150, -200, 300, 400);
    
    // 回転部分
    ctx.save();
    ctx.rotate(progress * Math.PI * 10);
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
  }

  /**
   * カード公開エフェクト再生
   */
  async playCardRevealEffect(element, rarity, duration) {
    // CSS アニメーション追加
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cardFlip {
        0% {
          transform: rotateY(180deg) scale(0.1);
          opacity: 0;
        }
        50% {
          transform: rotateY(90deg) scale(1.2);
          opacity: 0.8;
        }
        100% {
          transform: rotateY(0) scale(1);
          opacity: 1;
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
      }
      
      .gacha-card-reveal {
        animation: fadeIn 0.5s ease-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// React Hook として使用可能にする
export function useGachaEffect() {
  const [controller] = useState(() => new GachaEffectController());
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    controller.init().then(() => setIsReady(true));
    
    return () => {
      controller.cleanup();
    };
  }, [controller]);
  
  const playGacha = async (type, results) => {
    if (!isReady) return;
    await controller.playGachaEffect(type, results);
  };
  
  return {
    isReady,
    playGacha,
    controller
  };
}

export default GachaEffectController;