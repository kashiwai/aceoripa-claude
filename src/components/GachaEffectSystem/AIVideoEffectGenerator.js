import { useState, useEffect } from 'react';
import { RARITY_CONFIGS } from './EffectConfig';

// AI動画生成 + 音声合成システム
export default function AIVideoEffectGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState('explosion');
  const [selectedRarity, setSelectedRarity] = useState('SSR');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  // テンプレート定義
  const VIDEO_TEMPLATES = {
    explosion: {
      name: '爆発演出',
      description: '派手な爆発エフェクトでカード出現',
      prompt: 'Epic explosion effect with golden particles, dramatic lighting, cinematic style, 8 seconds, dark background transitioning to bright reveal',
      bgm: '/audio/bgm/epic-explosion.mp3',
      sfx: [
        { time: 0.5, file: '/audio/sfx/buildup.mp3' },
        { time: 3.0, file: '/audio/sfx/explosion-huge.mp3' },
        { time: 4.5, file: '/audio/sfx/sparkle-burst.mp3' },
        { time: 6.0, file: '/audio/sfx/victory-fanfare.mp3' }
      ]
    },
    galaxy: {
      name: '銀河演出',
      description: '宇宙空間から流れ星とともにカード降臨',
      prompt: 'Cosmic galaxy effect with shooting stars, nebula swirls, aurora lights, 8 seconds, deep space to bright star explosion',
      bgm: '/audio/bgm/cosmic-journey.mp3',
      sfx: [
        { time: 1.0, file: '/audio/sfx/space-whoosh.mp3' },
        { time: 3.5, file: '/audio/sfx/star-chime.mp3' },
        { time: 5.0, file: '/audio/sfx/cosmic-boom.mp3' }
      ]
    },
    lightning: {
      name: '雷撃演出',
      description: '稲妻が走り抜ける電撃エフェクト',
      prompt: 'Lightning storm effect with electric bolts, thunder strikes, energy buildup, 8 seconds, dark clouds to electric explosion',
      bgm: '/audio/bgm/thunder-storm.mp3',
      sfx: [
        { time: 0.2, file: '/audio/sfx/thunder-rumble.mp3' },
        { time: 2.5, file: '/audio/sfx/electric-charge.mp3' },
        { time: 4.0, file: '/audio/sfx/lightning-strike.mp3' },
        { time: 6.5, file: '/audio/sfx/electric-burst.mp3' }
      ]
    },
    rainbow: {
      name: '虹色演出',
      description: '虹色の光が広がる幻想的エフェクト',
      prompt: 'Rainbow spectrum effect with prismatic lights, color waves, magical particles, 8 seconds, colorful transition',
      bgm: '/audio/bgm/magical-rainbow.mp3',
      sfx: [
        { time: 1.5, file: '/audio/sfx/magic-sparkle.mp3' },
        { time: 3.0, file: '/audio/sfx/rainbow-sweep.mp3' },
        { time: 5.5, file: '/audio/sfx/crystal-chime.mp3' }
      ]
    },
    dragon: {
      name: 'ドラゴン演出',
      description: '炎を吐くドラゴンとともに登場',
      prompt: 'Fire dragon effect with flame breath, dragon roar, epic fantasy style, 8 seconds, dragon silhouette to fire explosion',
      bgm: '/audio/bgm/dragon-battle.mp3',
      sfx: [
        { time: 0.8, file: '/audio/sfx/dragon-roar.mp3' },
        { time: 2.5, file: '/audio/sfx/fire-breath.mp3' },
        { time: 4.2, file: '/audio/sfx/wing-flap.mp3' },
        { time: 6.0, file: '/audio/sfx/fire-explosion.mp3' }
      ]
    }
  };

  // AI動画生成フロー
  const generateAIVideo = async () => {
    setGenerating(true);
    setProgress(0);

    try {
      // Step 1: AI動画生成（Leonardo AI / RunwayML / Sora API）
      setProgress(10);
      const videoUrl = await generateBaseVideo();
      
      // Step 2: BGM・効果音合成
      setProgress(40);
      const audioMixedUrl = await mixAudioTracks(videoUrl);
      
      // Step 3: カード合成（タイミング調整）
      setProgress(70);
      const finalVideoUrl = await compositeCardReveal(audioMixedUrl);
      
      // Step 4: 最終処理
      setProgress(90);
      const webOptimizedUrl = await optimizeForWeb(finalVideoUrl);
      
      setProgress(100);
      setGeneratedVideo({
        url: webOptimizedUrl,
        template: selectedTemplate,
        rarity: selectedRarity,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('動画生成エラー:', error);
      alert('動画生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  // AI動画生成（実際のAPI呼び出し）
  const generateBaseVideo = async () => {
    const template = VIDEO_TEMPLATES[selectedTemplate];
    
    // Leonardo AI APIの例
    const response = await fetch('/api/generate-ai-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: template.prompt,
        duration: 8,
        style: 'cinematic',
        resolution: '1920x1080',
        fps: 60
      })
    });
    
    const data = await response.json();
    return data.videoUrl;
  };

  // 音声ミックス処理
  const mixAudioTracks = async (videoUrl) => {
    const template = VIDEO_TEMPLATES[selectedTemplate];
    
    const response = await fetch('/api/mix-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        bgm: template.bgm,
        sfx: template.sfx,
        masterVolume: 0.8
      })
    });
    
    const data = await response.json();
    return data.mixedVideoUrl;
  };

  // カード合成処理
  const compositeCardReveal = async (videoUrl) => {
    const response = await fetch('/api/composite-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        cardRevealTime: 4.0, // 4秒でカード出現
        cardImage: `/images/cards/${selectedRarity}.png`,
        effects: {
          glow: true,
          sparkles: true,
          hologram: selectedRarity === 'SSR' || selectedRarity === 'SS'
        }
      })
    });
    
    const data = await response.json();
    return data.compositedVideoUrl;
  };

  // Web最適化
  const optimizeForWeb = async (videoUrl) => {
    const response = await fetch('/api/optimize-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        format: 'mp4',
        codec: 'h264',
        bitrate: '8M',
        preset: 'web'
      })
    });
    
    const data = await response.json();
    return data.optimizedUrl;
  };

  return (
    <div className="ai-video-generator">
      <div className="generator-header">
        <h2>🎬 AI動画演出ジェネレーター</h2>
        <p>AI生成動画 + BGM + 効果音で究極の演出を作成</p>
      </div>

      <div className="generator-grid">
        {/* テンプレート選択 */}
        <div className="template-section">
          <h3>📽️ 演出テンプレート選択</h3>
          <div className="template-grid">
            {Object.entries(VIDEO_TEMPLATES).map(([key, template]) => (
              <div 
                key={key}
                className={`template-card ${selectedTemplate === key ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(key)}
              >
                <div className="template-preview">
                  <video 
                    src={`/preview/${key}-preview.mp4`}
                    autoPlay
                    loop
                    muted
                    className="preview-video"
                  />
                </div>
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div className="audio-info">
                  <span>🎵 BGM付き</span>
                  <span>🔊 効果音 {template.sfx.length}個</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* レアリティ選択 */}
        <div className="rarity-section">
          <h3>✨ レアリティ選択</h3>
          <div className="rarity-buttons">
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
                {rarity} - {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* 音声設定 */}
        <div className="audio-section">
          <h3>🎵 音声設定</h3>
          <div className="audio-controls">
            <div className="volume-control">
              <label>BGM音量</label>
              <input type="range" min="0" max="100" defaultValue="70" />
            </div>
            <div className="volume-control">
              <label>効果音音量</label>
              <input type="range" min="0" max="100" defaultValue="85" />
            </div>
            <div className="audio-preview">
              <button className="preview-btn">🎧 音声プレビュー</button>
            </div>
          </div>
        </div>

        {/* 生成ボタン */}
        <div className="generate-section">
          <button 
            className="generate-btn"
            onClick={generateAIVideo}
            disabled={generating}
            style={{
              background: generating 
                ? 'linear-gradient(45deg, #666, #888)'
                : 'linear-gradient(45deg, #FF6B6B, #FF8E53)'
            }}
          >
            {generating ? (
              <>
                <div className="spinner"></div>
                生成中... {progress}%
              </>
            ) : (
              <>
                🚀 AI動画生成開始
              </>
            )}
          </button>

          {generating && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="generation-steps">
            <div className={`step ${progress >= 10 ? 'active' : ''}`}>
              1. AI動画生成
            </div>
            <div className={`step ${progress >= 40 ? 'active' : ''}`}>
              2. 音声合成
            </div>
            <div className={`step ${progress >= 70 ? 'active' : ''}`}>
              3. カード合成
            </div>
            <div className={`step ${progress >= 90 ? 'active' : ''}`}>
              4. Web最適化
            </div>
          </div>
        </div>
      </div>

      {/* 生成結果 */}
      {generatedVideo && (
        <div className="result-section">
          <h3>✅ 生成完了！</h3>
          <div className="result-video">
            <video 
              src={generatedVideo.url}
              controls
              className="final-video"
            />
            <div className="video-info">
              <p>テンプレート: {VIDEO_TEMPLATES[generatedVideo.template].name}</p>
              <p>レアリティ: {generatedVideo.rarity}</p>
              <p>生成時刻: {new Date(generatedVideo.timestamp).toLocaleString()}</p>
            </div>
            <div className="action-buttons">
              <button className="download-btn">
                💾 ダウンロード
              </button>
              <button className="preview-btn">
                👁️ フルスクリーン
              </button>
              <button className="share-btn">
                📤 共有
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-video-generator {
          padding: 30px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          min-height: 100vh;
          color: white;
        }

        .generator-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .generator-header h2 {
          font-size: 36px;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .generator-grid {
          display: grid;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .template-section {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .template-card {
          background: rgba(0,0,0,0.3);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 15px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          transform: translateY(-5px);
          border-color: #FFD700;
        }

        .template-card.selected {
          border-color: #FF6B6B;
          background: rgba(255,107,107,0.2);
        }

        .preview-video {
          width: 100%;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .template-card h4 {
          font-size: 18px;
          margin: 10px 0;
        }

        .audio-info {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          font-size: 14px;
        }

        .audio-info span {
          background: rgba(255,255,255,0.2);
          padding: 5px 10px;
          border-radius: 20px;
        }

        .rarity-section, .audio-section {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .rarity-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .rarity-btn {
          padding: 15px;
          border: 2px solid;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .rarity-btn:hover {
          transform: scale(1.05);
        }

        .audio-controls {
          display: grid;
          gap: 20px;
          margin-top: 20px;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .volume-control label {
          min-width: 100px;
        }

        .volume-control input {
          flex: 1;
        }

        .preview-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .preview-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .generate-section {
          text-align: center;
          padding: 40px;
        }

        .generate-btn {
          padding: 20px 60px;
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .generate-btn:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 100%;
          max-width: 600px;
          height: 30px;
          background: rgba(0,0,0,0.3);
          border-radius: 15px;
          margin: 20px auto;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
        }

        .generation-steps {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .step {
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .step.active {
          opacity: 1;
          background: rgba(76,175,80,0.3);
          border: 1px solid #4CAF50;
        }

        .result-section {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          margin-top: 40px;
          backdrop-filter: blur(10px);
        }

        .final-video {
          width: 100%;
          max-width: 800px;
          border-radius: 15px;
          margin: 20px auto;
          display: block;
        }

        .video-info {
          text-align: center;
          margin: 20px 0;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .download-btn, .preview-btn, .share-btn {
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

        .share-btn {
          background: #FF5722;
          color: white;
        }

        .download-btn:hover, .preview-btn:hover, .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}