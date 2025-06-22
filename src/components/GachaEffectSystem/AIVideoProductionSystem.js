import { useState, useEffect } from 'react';
import { RARITY_CONFIGS } from './EffectConfig';

// AI動画制作システム（OpenAI静止画 + Leonardo動画）
export default function AIVideoProductionSystem() {
  const [selectedTemplate, setSelectedTemplate] = useState('explosion');
  const [selectedRarity, setSelectedRarity] = useState('SSR');
  const [productionStep, setProductionStep] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [generatedAssets, setGeneratedAssets] = useState({});

  // テンプレート定義
  const PRODUCTION_TEMPLATES = {
    explosion: {
      name: '爆発演出',
      description: '派手な爆発エフェクトでカード出現',
      openaiPrompt: 'Epic explosion effect centerpiece, golden particles floating, dramatic lighting, dark to bright transition, cinematic composition, no text',
      leonardoPrompt: 'explosion particles moving outward, energy burst animation, dynamic motion',
      bgm: '/audio/bgm/epic-explosion.mp3',
      sfx: [
        { time: 0.5, file: '/audio/sfx/charge-up.mp3' },
        { time: 3.0, file: '/audio/sfx/massive-explosion.mp3' },
        { time: 4.5, file: '/audio/sfx/sparkle-rain.mp3' },
        { time: 6.0, file: '/audio/sfx/victory-impact.mp3' }
      ]
    },
    galaxy: {
      name: '銀河演出',
      description: '宇宙空間から流れ星とともに降臨',
      openaiPrompt: 'Cosmic galaxy swirl, shooting stars, nebula clouds, aurora lights, deep space atmosphere, mystical glow',
      leonardoPrompt: 'swirling galaxy motion, shooting stars movement, nebula drift animation',
      bgm: '/audio/bgm/cosmic-journey.mp3',
      sfx: [
        { time: 1.0, file: '/audio/sfx/space-ambient.mp3' },
        { time: 3.5, file: '/audio/sfx/star-chime.mp3' },
        { time: 5.0, file: '/audio/sfx/cosmic-reveal.mp3' }
      ]
    },
    lightning: {
      name: '雷撃演出',
      description: '稲妻が走り抜ける電撃エフェクト',
      openaiPrompt: 'Lightning storm atmosphere, electric bolts frozen in time, thunder clouds, energy field, dramatic blue lighting',
      leonardoPrompt: 'lightning strike animation, electric current flow, thunder flash motion',
      bgm: '/audio/bgm/thunder-storm.mp3',
      sfx: [
        { time: 0.2, file: '/audio/sfx/thunder-roll.mp3' },
        { time: 2.5, file: '/audio/sfx/electric-surge.mp3' },
        { time: 4.0, file: '/audio/sfx/lightning-crack.mp3' }
      ]
    },
    dragon: {
      name: 'ドラゴン演出',
      description: '炎を吐く竜が舞い降りる',
      openaiPrompt: 'Majestic fire dragon silhouette, flame breath effect, epic fantasy atmosphere, molten lava glow, scales detail',
      leonardoPrompt: 'dragon breathing fire animation, wing flapping motion, flame swirl movement',
      bgm: '/audio/bgm/dragon-battle.mp3',
      sfx: [
        { time: 0.8, file: '/audio/sfx/dragon-roar.mp3' },
        { time: 2.5, file: '/audio/sfx/fire-breath.mp3' },
        { time: 4.2, file: '/audio/sfx/wing-beat.mp3' }
      ]
    },
    rainbow: {
      name: '虹色演出',
      description: '七色の光が織りなす幻想的な世界',
      openaiPrompt: 'Rainbow prism effect, iridescent light rays, magical sparkles, dreamy atmosphere, color spectrum burst',
      leonardoPrompt: 'rainbow wave animation, prismatic light flow, color transition motion',
      bgm: '/audio/bgm/magical-rainbow.mp3',
      sfx: [
        { time: 1.5, file: '/audio/sfx/magic-bell.mp3' },
        { time: 3.0, file: '/audio/sfx/rainbow-sweep.mp3' },
        { time: 5.5, file: '/audio/sfx/crystal-resonance.mp3' }
      ]
    }
  };

  // 制作フロー開始
  const startProduction = async () => {
    setProductionStep('generating');
    setProgress(0);
    setGeneratedAssets({});

    try {
      // Step 1: OpenAIで静止画生成（キーフレーム）
      setProductionStep('openai-image');
      const keyframes = await generateKeyframesWithOpenAI();
      setGeneratedAssets(prev => ({ ...prev, keyframes }));
      setProgress(25);

      // Step 2: Leonardoで動画化
      setProductionStep('leonardo-motion');
      const videos = await generateMotionWithLeonardo(keyframes);
      setGeneratedAssets(prev => ({ ...prev, videos }));
      setProgress(50);

      // Step 3: 音声合成
      setProductionStep('audio-mixing');
      const audioMixed = await mixAudioTracks(videos);
      setGeneratedAssets(prev => ({ ...prev, audioMixed }));
      setProgress(75);

      // Step 4: 最終合成
      setProductionStep('final-composite');
      const finalVideo = await createFinalComposite(audioMixed);
      setGeneratedAssets(prev => ({ ...prev, finalVideo }));
      setProgress(100);

      setProductionStep('complete');
    } catch (error) {
      console.error('Production error:', error);
      setProductionStep('error');
    }
  };

  // OpenAIでキーフレーム生成
  const generateKeyframesWithOpenAI = async () => {
    const template = PRODUCTION_TEMPLATES[selectedTemplate];
    const config = RARITY_CONFIGS[selectedRarity];
    
    // 3つのキーフレームを生成
    const keyframePrompts = [
      `${template.openaiPrompt}, beginning scene, mysterious atmosphere, ${config.color} accent`,
      `${template.openaiPrompt}, climax moment, maximum intensity, ${config.color} dominant`,
      `${template.openaiPrompt}, reveal scene, triumphant mood, ${config.color} glow`
    ];

    const keyframes = [];
    for (const prompt of keyframePrompts) {
      const response = await fetch('/api/generate-gacha-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          rarity: selectedRarity,
          useAI: 'openai',
          customPrompt: prompt
        })
      });
      
      const data = await response.json();
      keyframes.push(data.imageUrl);
    }

    return keyframes;
  };

  // Leonardoで動画生成
  const generateMotionWithLeonardo = async (keyframes) => {
    const template = PRODUCTION_TEMPLATES[selectedTemplate];
    const videos = [];

    for (const keyframe of keyframes) {
      const response = await fetch('/api/generate-gacha-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          rarity: selectedRarity,
          useAI: 'leonardo',
          sourceImage: keyframe,
          motionPrompt: template.leonardoPrompt
        })
      });
      
      const data = await response.json();
      videos.push(data.videoUrl);
    }

    return videos;
  };

  // 音声ミックス
  const mixAudioTracks = async (videos) => {
    const template = PRODUCTION_TEMPLATES[selectedTemplate];
    
    const response = await fetch('/api/mix-gacha-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videos,
        bgm: template.bgm,
        sfx: template.sfx,
        duration: 8000
      })
    });

    const data = await response.json();
    return data.mixedVideoUrl;
  };

  // 最終合成
  const createFinalComposite = async (audioMixedVideo) => {
    const response = await fetch('/api/finalize-gacha-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: audioMixedVideo,
        cardImage: `/images/cards/${selectedRarity}.png`,
        revealTime: 4.0,
        effects: {
          glow: true,
          particles: true,
          hologram: selectedRarity === 'SSR' || selectedRarity === 'SS',
          text: `${RARITY_CONFIGS[selectedRarity].name} GET!`
        }
      })
    });

    const data = await response.json();
    return data.finalVideoUrl;
  };

  return (
    <div className="ai-video-production">
      <div className="production-header">
        <h2>🎬 AI動画制作システム</h2>
        <p>OpenAI（静止画）× Leonardo AI（動画）で最高品質の演出を実現</p>
      </div>

      <div className="production-workflow">
        <div className="workflow-steps">
          <div className={`step ${productionStep === 'openai-image' ? 'active' : ''}`}>
            <div className="step-icon">🎨</div>
            <div className="step-name">OpenAI</div>
            <div className="step-desc">キーフレーム生成</div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className={`step ${productionStep === 'leonardo-motion' ? 'active' : ''}`}>
            <div className="step-icon">🎥</div>
            <div className="step-name">Leonardo</div>
            <div className="step-desc">動画化</div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className={`step ${productionStep === 'audio-mixing' ? 'active' : ''}`}>
            <div className="step-icon">🎵</div>
            <div className="step-name">音声合成</div>
            <div className="step-desc">BGM+効果音</div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className={`step ${productionStep === 'final-composite' ? 'active' : ''}`}>
            <div className="step-icon">✨</div>
            <div className="step-name">最終合成</div>
            <div className="step-desc">完成</div>
          </div>
        </div>
      </div>

      <div className="production-controls">
        {/* テンプレート選択 */}
        <div className="template-selection">
          <h3>📽️ 演出テンプレート</h3>
          <div className="template-grid">
            {Object.entries(PRODUCTION_TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                className={`template-card ${selectedTemplate === key ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(key)}
              >
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div className="template-features">
                  <span>🎵 BGM</span>
                  <span>🔊 効果音×{template.sfx.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* レアリティ選択 */}
        <div className="rarity-selection">
          <h3>⭐ レアリティ</h3>
          <div className="rarity-grid">
            {Object.entries(RARITY_CONFIGS).map(([rarity, config]) => (
              <button
                key={rarity}
                className={`rarity-btn ${selectedRarity === rarity ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedRarity === rarity ? config.color : 'transparent',
                  borderColor: config.color,
                  color: selectedRarity === rarity ? 'white' : config.color
                }}
                onClick={() => setSelectedRarity(rarity)}
              >
                <div>{rarity}</div>
                <div className="rarity-name">{config.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 制作開始ボタン */}
        <div className="production-actions">
          <button
            className="start-btn"
            onClick={startProduction}
            disabled={productionStep !== 'idle' && productionStep !== 'complete'}
          >
            {productionStep === 'idle' ? '🚀 制作開始' : 
             productionStep === 'generating' ? '⏳ 制作中...' :
             productionStep === 'complete' ? '✅ 完成！もう一度' :
             productionStep === 'error' ? '❌ エラー・再試行' :
             '🔄 処理中...'}
          </button>

          {productionStep !== 'idle' && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
              <span className="progress-text">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 生成アセット表示 */}
      {Object.keys(generatedAssets).length > 0 && (
        <div className="generated-assets">
          <h3>🎨 生成アセット</h3>
          
          {generatedAssets.keyframes && (
            <div className="asset-section">
              <h4>OpenAI キーフレーム</h4>
              <div className="keyframes-grid">
                {generatedAssets.keyframes.map((url, index) => (
                  <img 
                    key={index}
                    src={url} 
                    alt={`Keyframe ${index + 1}`}
                    className="keyframe-img"
                  />
                ))}
              </div>
            </div>
          )}

          {generatedAssets.finalVideo && (
            <div className="asset-section">
              <h4>完成動画</h4>
              <video 
                src={generatedAssets.finalVideo}
                controls
                className="final-video"
              />
              <div className="video-actions">
                <button className="download-btn">
                  💾 ダウンロード
                </button>
                <button className="preview-btn">
                  🎮 ゲームで確認
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .ai-video-production {
          padding: 30px;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          min-height: 100vh;
          color: white;
        }

        .production-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .production-header h2 {
          font-size: 36px;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .production-workflow {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
        }

        .workflow-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .step {
          text-align: center;
          padding: 20px;
          background: rgba(0,0,0,0.3);
          border-radius: 15px;
          transition: all 0.3s ease;
          opacity: 0.6;
        }

        .step.active {
          opacity: 1;
          background: rgba(255,215,0,0.2);
          border: 2px solid #FFD700;
          transform: scale(1.1);
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .step-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .step-desc {
          font-size: 14px;
          opacity: 0.8;
        }

        .workflow-arrow {
          font-size: 24px;
          opacity: 0.5;
        }

        .production-controls {
          background: rgba(255,255,255,0.05);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .template-selection, .rarity-selection {
          margin-bottom: 30px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .template-card {
          background: rgba(0,0,0,0.4);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          transform: translateY(-5px);
          border-color: #FFD700;
        }

        .template-card.selected {
          background: rgba(255,215,0,0.2);
          border-color: #FFD700;
        }

        .template-card h4 {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .template-card p {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 15px;
        }

        .template-features {
          display: flex;
          gap: 10px;
          font-size: 12px;
        }

        .template-features span {
          background: rgba(255,255,255,0.1);
          padding: 5px 10px;
          border-radius: 20px;
        }

        .rarity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .rarity-btn {
          padding: 15px;
          border: 2px solid;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .rarity-btn:hover {
          transform: scale(1.05);
        }

        .rarity-name {
          font-size: 12px;
          margin-top: 5px;
          opacity: 0.8;
        }

        .production-actions {
          text-align: center;
          margin-top: 40px;
        }

        .start-btn {
          padding: 20px 60px;
          font-size: 24px;
          font-weight: bold;
          border: none;
          border-radius: 50px;
          background: linear-gradient(45deg, #FF6B6B, #FF8E53);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .start-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255,107,107,0.4);
        }

        .start-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .progress-bar {
          width: 100%;
          max-width: 600px;
          height: 40px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          margin: 20px auto;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          font-size: 18px;
        }

        .generated-assets {
          background: rgba(255,255,255,0.05);
          padding: 30px;
          border-radius: 20px;
          margin-top: 40px;
          backdrop-filter: blur(10px);
        }

        .asset-section {
          margin-bottom: 30px;
        }

        .keyframes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 20px;
        }

        .keyframe-img {
          width: 100%;
          border-radius: 10px;
          border: 2px solid rgba(255,255,255,0.2);
        }

        .final-video {
          width: 100%;
          max-width: 800px;
          border-radius: 15px;
          margin: 20px auto;
          display: block;
        }

        .video-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .download-btn, .preview-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-btn {
          background: #4CAF50;
          color: white;
        }

        .preview-btn {
          background: #2196F3;
          color: white;
        }

        .download-btn:hover, .preview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }

        @media (max-width: 768px) {
          .workflow-steps {
            flex-direction: column;
          }
          
          .workflow-arrow {
            transform: rotate(90deg);
          }
          
          .template-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}