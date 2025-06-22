import { useState, useEffect, useRef } from 'react';
import { RARITY_CONFIGS } from './EffectConfig';

// エフェクト再生コンポーネント
export default function EffectPlayer({ rarity, cardData, onEffectComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('prepare'); // prepare, reveal, celebrate
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  const config = RARITY_CONFIGS[rarity] || RARITY_CONFIGS.N;

  useEffect(() => {
    if (isPlaying) {
      playEffect();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // エフェクト再生メイン処理
  const playEffect = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定
    canvas.width = 800;
    canvas.height = 600;

    // フェーズ1: 準備演出
    setCurrentPhase('prepare');
    await prepareEffect(ctx);

    // フェーズ2: カード出現
    setCurrentPhase('reveal');
    await revealCard(ctx);

    // フェーズ3: 祝福演出
    setCurrentPhase('celebrate');
    await celebrateEffect(ctx);

    // 完了
    setIsPlaying(false);
    onEffectComplete?.(rarity, cardData);
  };

  // 準備演出
  const prepareEffect = (ctx) => {
    return new Promise((resolve) => {
      let frame = 0;
      const maxFrames = 60;

      const animate = () => {
        ctx.clearRect(0, 0, 800, 600);
        
        // 背景グラデーション
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
        gradient.addColorStop(0, config.bgColor);
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // 集中線エフェクト
        const lines = 36;
        const progress = frame / maxFrames;
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.3 + progress * 0.7;
        
        for (let i = 0; i < lines; i++) {
          const angle = (i / lines) * Math.PI * 2;
          const length = 50 + progress * 350;
          ctx.beginPath();
          ctx.moveTo(400, 300);
          ctx.lineTo(
            400 + Math.cos(angle) * length,
            300 + Math.sin(angle) * length
          );
          ctx.stroke();
        }

        // 中央の光
        const lightGrad = ctx.createRadialGradient(400, 300, 0, 400, 300, 100 * progress);
        lightGrad.addColorStop(0, config.color);
        lightGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lightGrad;
        ctx.globalAlpha = 1 - progress;
        ctx.fillRect(0, 0, 800, 600);

        frame++;
        if (frame < maxFrames) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // カード出現演出
  const revealCard = (ctx) => {
    return new Promise((resolve) => {
      let frame = 0;
      const maxFrames = 90;

      const animate = () => {
        ctx.clearRect(0, 0, 800, 600);
        
        // 背景
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
        gradient.addColorStop(0, config.bgColor);
        gradient.addColorStop(1, '#222222');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        const progress = frame / maxFrames;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // カード枠
        const cardWidth = 200 * easeOut;
        const cardHeight = 280 * easeOut;
        const cardX = 400 - cardWidth / 2;
        const cardY = 300 - cardHeight / 2;

        // カード影
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        
        // カード背景
        ctx.fillStyle = config.color;
        ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

        // カード枠
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

        // レアリティ表示
        if (progress > 0.5) {
          ctx.shadowColor = 'transparent';
          ctx.font = `bold ${48 * easeOut}px Arial`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rarity, 400, 300);
        }

        // エフェクトタイプ別演出
        if (config.effectType === 'explosion' || config.effectType === 'rainbow_explosion') {
          // 爆発パーティクル
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = progress * 200;
            const x = 400 + Math.cos(angle) * distance;
            const y = 300 + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, 5 + progress * 10, 0, Math.PI * 2);
            ctx.fillStyle = config.effectType === 'rainbow_explosion' 
              ? `hsl(${(i * 18) % 360}, 100%, 50%)`
              : config.color;
            ctx.fill();
          }
        }

        frame++;
        if (frame < maxFrames) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // 祝福演出
  const celebrateEffect = (ctx) => {
    return new Promise((resolve) => {
      let frame = 0;
      const maxFrames = 120;

      const animate = () => {
        ctx.clearRect(0, 0, 800, 600);
        
        // 背景
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
        gradient.addColorStop(0, config.bgColor);
        gradient.addColorStop(1, '#111111');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        const progress = frame / maxFrames;

        // カード（固定表示）
        const cardWidth = 200;
        const cardHeight = 280;
        const cardX = 400 - cardWidth / 2;
        const cardY = 300 - cardHeight / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = config.color;
        ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

        // レアリティテキスト
        ctx.shadowColor = 'transparent';
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rarity, 400, 300);

        // キラキラエフェクト
        for (let i = 0; i < 50; i++) {
          const sparkleX = 100 + (Math.sin(frame * 0.02 + i) * 300) + 300;
          const sparkleY = 100 + (Math.cos(frame * 0.015 + i) * 200) + 200;
          const size = 2 + Math.sin(frame * 0.1 + i) * 3;
          
          ctx.save();
          ctx.translate(sparkleX, sparkleY);
          ctx.rotate(frame * 0.05 + i);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-size/2, -size, size, size*2);
          ctx.fillRect(-size, -size/2, size*2, size);
          
          ctx.restore();
        }

        // 文字演出
        if (progress > 0.3) {
          ctx.font = 'bold 36px Arial';
          ctx.fillStyle = config.color;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          const text = config.name + ' GET!';
          const textY = 480 + Math.sin(frame * 0.2) * 10;
          ctx.strokeText(text, 400, textY);
          ctx.fillText(text, 400, textY);
        }

        frame++;
        if (frame < maxFrames) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // 音声再生
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const startEffect = () => {
    setIsPlaying(true);
    playSound();
  };

  return (
    <div className="effect-player">
      <div className="player-container">
        <canvas 
          ref={canvasRef} 
          className="effect-canvas"
          width="800" 
          height="600"
        />
        
        <div className="player-overlay">
          {!isPlaying && (
            <div className="start-screen">
              <div className="rarity-preview" style={{ color: config.color }}>
                <h2>{rarity}</h2>
                <p>{config.name}</p>
              </div>
              <button 
                className="start-btn"
                style={{ backgroundColor: config.color }}
                onClick={startEffect}
              >
                🎬 演出開始
              </button>
            </div>
          )}

          {isPlaying && (
            <div className="phase-indicator">
              <div className={`phase ${currentPhase === 'prepare' ? 'active' : ''}`}>
                準備中...
              </div>
              <div className={`phase ${currentPhase === 'reveal' ? 'active' : ''}`}>
                カード出現!
              </div>
              <div className={`phase ${currentPhase === 'celebrate' ? 'active' : ''}`}>
                {config.name} GET!
              </div>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} preload="auto">
        <source src={config.sound} type="audio/mpeg" />
      </audio>

      <style jsx>{`
        .effect-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .player-container {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }

        .effect-canvas {
          display: block;
          background: #000;
          border-radius: 16px;
        }

        .player-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .start-screen {
          text-align: center;
          background: rgba(0,0,0,0.8);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .rarity-preview h2 {
          font-size: 48px;
          margin: 0 0 10px 0;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .rarity-preview p {
          font-size: 24px;
          margin: 0 0 30px 0;
          color: #fff;
        }

        .start-btn {
          background: #FF6B6B;
          color: white;
          border: none;
          padding: 20px 40px;
          font-size: 24px;
          font-weight: bold;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }

        .phase-indicator {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          padding: 15px 30px;
          border-radius: 25px;
          backdrop-filter: blur(10px);
          display: flex;
          gap: 20px;
        }

        .phase {
          color: #999;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .phase.active {
          color: #FFD700;
          text-shadow: 0 0 10px #FFD700;
        }
      `}</style>
    </div>
  );
}