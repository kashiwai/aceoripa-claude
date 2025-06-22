import { useState, useRef, useEffect } from 'react';
import { RARITY_CONFIGS } from './EffectConfig';

// 動画生成コンポーネント
export default function VideoGenerator() {
  const [selectedRarity, setSelectedRarity] = useState('SSR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [videoSettings, setVideoSettings] = useState({
    width: 1920,
    height: 1080,
    fps: 60,
    duration: 5000,
    format: 'mp4',
    quality: 'high'
  });
  
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // 動画生成
  const generateVideo = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // キャンバス設定
    canvas.width = videoSettings.width;
    canvas.height = videoSettings.height;

    try {
      // MediaRecorder設定
      const stream = canvas.captureStream(videoSettings.fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recordedChunks.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString();
        
        setGeneratedVideos(prev => [...prev, {
          id: Date.now(),
          url,
          rarity: selectedRarity,
          timestamp,
          settings: { ...videoSettings },
          size: blob.size
        }]);
        
        setIsGenerating(false);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      // アニメーション実行
      await renderAnimation(ctx);
      
      // 録画停止
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('動画生成エラー:', error);
      setIsGenerating(false);
    }
  };

  // アニメーション描画
  const renderAnimation = (ctx) => {
    return new Promise((resolve) => {
      const config = RARITY_CONFIGS[selectedRarity];
      const totalFrames = Math.floor((videoSettings.duration / 1000) * videoSettings.fps);
      let frame = 0;

      const animate = () => {
        const progress = frame / totalFrames;
        
        // 背景クリア
        ctx.clearRect(0, 0, videoSettings.width, videoSettings.height);
        
        // 背景グラデーション
        const gradient = ctx.createRadialGradient(
          videoSettings.width/2, videoSettings.height/2, 0,
          videoSettings.width/2, videoSettings.height/2, videoSettings.width * 0.7
        );
        gradient.addColorStop(0, config.bgColor);
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, videoSettings.width, videoSettings.height);

        // フェーズ別演出
        if (progress < 0.3) {
          // 準備フェーズ
          renderPreparePhase(ctx, progress / 0.3, config);
        } else if (progress < 0.7) {
          // カード出現フェーズ
          renderRevealPhase(ctx, (progress - 0.3) / 0.4, config);
        } else {
          // 祝福フェーズ
          renderCelebratePhase(ctx, (progress - 0.7) / 0.3, config);
        }

        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // 準備フェーズ描画
  const renderPreparePhase = (ctx, progress, config) => {
    const centerX = videoSettings.width / 2;
    const centerY = videoSettings.height / 2;
    
    // 集中線
    const lines = 48;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.3 + progress * 0.7;
    
    for (let i = 0; i < lines; i++) {
      const angle = (i / lines) * Math.PI * 2;
      const length = 100 + progress * (videoSettings.width * 0.6);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      ctx.stroke();
    }

    // 中央の光
    const lightGrad = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 200 * progress
    );
    lightGrad.addColorStop(0, config.color);
    lightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGrad;
    ctx.globalAlpha = 1 - progress;
    ctx.fillRect(0, 0, videoSettings.width, videoSettings.height);
    
    ctx.globalAlpha = 1;
  };

  // カード出現フェーズ描画
  const renderRevealPhase = (ctx, progress, config) => {
    const centerX = videoSettings.width / 2;
    const centerY = videoSettings.height / 2;
    const easeOut = 1 - Math.pow(1 - progress, 3);

    // カード
    const cardScale = videoSettings.width / 800; // スケール調整
    const cardWidth = 300 * easeOut * cardScale;
    const cardHeight = 420 * easeOut * cardScale;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    // カード影
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    
    // カード背景
    ctx.fillStyle = config.color;
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

    // カード枠
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

    // レアリティ表示
    if (progress > 0.5) {
      ctx.shadowColor = 'transparent';
      ctx.font = `bold ${96 * easeOut * cardScale}px Arial`;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(selectedRarity, centerX, centerY);
      ctx.fillText(selectedRarity, centerX, centerY);
    }

    // エフェクト
    if (config.effectType === 'explosion' || config.effectType === 'rainbow_explosion') {
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const distance = progress * 400 * cardScale;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.arc(x, y, (10 + progress * 20) * cardScale, 0, Math.PI * 2);
        ctx.fillStyle = config.effectType === 'rainbow_explosion' 
          ? `hsl(${(i * 12) % 360}, 100%, 50%)`
          : config.color;
        ctx.fill();
      }
    }
  };

  // 祝福フェーズ描画
  const renderCelebratePhase = (ctx, progress, config) => {
    const centerX = videoSettings.width / 2;
    const centerY = videoSettings.height / 2;
    const cardScale = videoSettings.width / 800;

    // カード（固定）
    const cardWidth = 300 * cardScale;
    const cardHeight = 420 * cardScale;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = config.color;
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

    // レアリティテキスト
    ctx.shadowColor = 'transparent';
    ctx.font = `bold ${96 * cardScale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(selectedRarity, centerX, centerY);
    ctx.fillText(selectedRarity, centerX, centerY);

    // キラキラ
    const sparkleCount = 80;
    for (let i = 0; i < sparkleCount; i++) {
      const time = progress * 10 + i * 0.1;
      const sparkleX = centerX + Math.sin(time + i) * (300 + Math.cos(time * 0.5) * 200) * cardScale;
      const sparkleY = centerY + Math.cos(time * 1.2 + i) * (200 + Math.sin(time * 0.3) * 150) * cardScale;
      const size = (3 + Math.sin(time * 2 + i) * 2) * cardScale;
      
      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(time + i);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-size/2, -size*2, size, size*4);
      ctx.fillRect(-size*2, -size/2, size*4, size);
      
      ctx.restore();
    }

    // 文字演出
    if (progress > 0.3) {
      ctx.font = `bold ${72 * cardScale}px Arial`;
      ctx.fillStyle = config.color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      const text = config.name + ' GET!';
      const textY = centerY + 300 * cardScale + Math.sin(progress * 20) * 20;
      ctx.strokeText(text, centerX, textY);
      ctx.fillText(text, centerX, textY);
    }
  };

  // 動画ダウンロード
  const downloadVideo = (video) => {
    const a = document.createElement('a');
    a.href = video.url;
    a.download = `gacha_effect_${video.rarity}_${video.id}.webm`;
    a.click();
  };

  // 動画削除
  const deleteVideo = (id) => {
    setGeneratedVideos(prev => {
      const video = prev.find(v => v.id === id);
      if (video) {
        URL.revokeObjectURL(video.url);
      }
      return prev.filter(v => v.id !== id);
    });
  };

  return (
    <div className="video-generator">
      <div className="generator-header">
        <h2>🎬 ガチャ演出動画生成</h2>
        <p>レアリティ別の演出動画を高品質で生成します</p>
      </div>

      <div className="generator-content">
        {/* 設定パネル */}
        <div className="settings-panel">
          <h3>📹 生成設定</h3>
          
          <div className="setting-group">
            <label>レアリティ選択</label>
            <div className="rarity-selector">
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
                  <span className="rarity-name">{rarity}</span>
                  <span className="rarity-desc">{config.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>動画設定</label>
            <div className="video-settings">
              <div className="setting-row">
                <span>解像度:</span>
                <select 
                  value={`${videoSettings.width}x${videoSettings.height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setVideoSettings(prev => ({ ...prev, width: w, height: h }));
                  }}
                >
                  <option value="1920x1080">フルHD (1920x1080)</option>
                  <option value="1280x720">HD (1280x720)</option>
                  <option value="3840x2160">4K (3840x2160)</option>
                  <option value="1080x1080">スクエア (1080x1080)</option>
                </select>
              </div>
              
              <div className="setting-row">
                <span>フレームレート:</span>
                <select 
                  value={videoSettings.fps}
                  onChange={(e) => setVideoSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                  <option value={120}>120 FPS</option>
                </select>
              </div>
              
              <div className="setting-row">
                <span>動画長:</span>
                <input 
                  type="range"
                  min="2000"
                  max="10000"
                  step="500"
                  value={videoSettings.duration}
                  onChange={(e) => setVideoSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
                <span>{(videoSettings.duration / 1000).toFixed(1)}秒</span>
              </div>
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={generateVideo}
            disabled={isGenerating}
            style={{ backgroundColor: RARITY_CONFIGS[selectedRarity].color }}
          >
            {isGenerating ? (
              <>
                <span className="loading-spinner"></span>
                生成中...
              </>
            ) : (
              <>
                🎬 動画生成開始
              </>
            )}
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="preview-area">
          <h3>📺 プレビュー</h3>
          <div className="canvas-container">
            <canvas 
              ref={canvasRef}
              className="preview-canvas"
              style={{
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                aspectRatio: `${videoSettings.width} / ${videoSettings.height}`
              }}
            />
            {isGenerating && (
              <div className="generating-overlay">
                <div className="generating-content">
                  <div className="pulse-circle"></div>
                  <p>動画生成中...</p>
                  <p>品質: {videoSettings.width}x{videoSettings.height} @ {videoSettings.fps}fps</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 生成済み動画一覧 */}
      {generatedVideos.length > 0 && (
        <div className="generated-videos">
          <h3>📂 生成済み動画 ({generatedVideos.length})</h3>
          <div className="video-grid">
            {generatedVideos.map((video) => (
              <div key={video.id} className="video-item">
                <div className="video-preview">
                  <video 
                    src={video.url} 
                    controls 
                    loop
                    className="video-element"
                    style={{ borderColor: RARITY_CONFIGS[video.rarity].color }}
                  />
                </div>
                <div className="video-info">
                  <div className="video-header">
                    <span 
                      className="video-rarity"
                      style={{ color: RARITY_CONFIGS[video.rarity].color }}
                    >
                      {video.rarity}
                    </span>
                    <span className="video-size">
                      {(video.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <div className="video-details">
                    <p>{video.settings.width}x{video.settings.height} @ {video.settings.fps}fps</p>
                    <p>{new Date(video.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="video-actions">
                    <button 
                      className="download-btn"
                      onClick={() => downloadVideo(video)}
                    >
                      📥 ダウンロード
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteVideo(video.id)}
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .video-generator {
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
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

        .generator-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .generator-content {
            grid-template-columns: 1fr;
          }
        }

        .settings-panel {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .settings-panel h3 {
          font-size: 24px;
          margin-bottom: 25px;
        }

        .setting-group {
          margin-bottom: 30px;
        }

        .setting-group label {
          display: block;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .rarity-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .rarity-btn {
          padding: 15px 10px;
          border: 2px solid;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .rarity-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .rarity-name {
          display: block;
          font-size: 16px;
        }

        .rarity-desc {
          display: block;
          font-size: 12px;
          opacity: 0.8;
        }

        .video-settings {
          background: rgba(0,0,0,0.2);
          padding: 20px;
          border-radius: 12px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
          gap: 10px;
        }

        .setting-row select,
        .setting-row input {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: white;
          color: #333;
        }

        .generate-btn {
          width: 100%;
          padding: 20px;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .preview-area {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .canvas-container {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .preview-canvas {
          border-radius: 12px;
        }

        .generating-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }

        .generating-content {
          text-align: center;
        }

        .pulse-circle {
          width: 60px;
          height: 60px;
          border: 3px solid #fff;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .generated-videos {
          background: rgba(255,255,255,0.1);
          padding: 30px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .video-item {
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .video-element {
          width: 100%;
          border-radius: 8px;
          border: 2px solid;
        }

        .video-info {
          margin-top: 15px;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .video-rarity {
          font-size: 18px;
          font-weight: bold;
        }

        .video-size {
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .video-details {
          margin-bottom: 15px;
          font-size: 14px;
          opacity: 0.8;
        }

        .video-actions {
          display: flex;
          gap: 10px;
        }

        .download-btn, .delete-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .download-btn {
          background: #28a745;
          color: white;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .download-btn:hover, .delete-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}