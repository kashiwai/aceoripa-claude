import { useState, useEffect } from 'react';

// レアリティ設定
export const RARITY_CONFIGS = {
  N: {
    name: 'ノーマル',
    color: '#CCCCCC',
    bgColor: '#F5F5F5',
    effectType: 'simple',
    duration: 1000,
    sound: '/sounds/normal.mp3'
  },
  R: {
    name: 'レア',
    color: '#4169E1',
    bgColor: '#E6F3FF',
    effectType: 'shine',
    duration: 1500,
    sound: '/sounds/rare.mp3'
  },
  SR: {
    name: 'スーパーレア',
    color: '#FFD700',
    bgColor: '#FFF8DC',
    effectType: 'burst',
    duration: 2000,
    sound: '/sounds/sr.mp3'
  },
  SSR: {
    name: '激レア',
    color: '#FF6347',
    bgColor: '#FFE4E1',
    effectType: 'explosion',
    duration: 3000,
    sound: '/sounds/ssr.mp3'
  },
  SS: {
    name: '超激レア',
    color: '#FF1493',
    bgColor: '#FFE4F1',
    effectType: 'rainbow_explosion',
    duration: 4000,
    sound: '/sounds/ss.mp3'
  },
  PSA10: {
    name: 'PSA10確定',
    color: '#FF0000',
    bgColor: '#FFCCCC',
    effectType: 'ultimate_explosion',
    duration: 5000,
    sound: '/sounds/psa10.mp3'
  }
};

// エフェクト設定コンポーネント
export default function EffectConfig({ onConfigChange }) {
  const [configs, setConfigs] = useState(RARITY_CONFIGS);
  const [selectedRarity, setSelectedRarity] = useState('SSR');

  const updateConfig = (rarity, field, value) => {
    const newConfigs = {
      ...configs,
      [rarity]: {
        ...configs[rarity],
        [field]: value
      }
    };
    setConfigs(newConfigs);
    onConfigChange?.(newConfigs);
  };

  const currentConfig = configs[selectedRarity];

  return (
    <div className="effect-config">
      <div className="config-header">
        <h2>🎊 ガチャ演出設定</h2>
        <p>レアリティ別の演出効果を設定できます</p>
      </div>

      {/* レアリティ選択タブ */}
      <div className="rarity-tabs">
        {Object.entries(configs).map(([rarity, config]) => (
          <button
            key={rarity}
            className={`rarity-tab ${selectedRarity === rarity ? 'active' : ''}`}
            style={{
              backgroundColor: selectedRarity === rarity ? config.color : '#f0f0f0',
              color: selectedRarity === rarity ? 'white' : config.color,
              border: `2px solid ${config.color}`
            }}
            onClick={() => setSelectedRarity(rarity)}
          >
            <div className="tab-content">
              <span className="rarity-name">{rarity}</span>
              <span className="rarity-desc">{config.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 設定パネル */}
      <div className="config-panel">
        <h3>🎯 {selectedRarity} - {currentConfig.name} 設定</h3>
        
        <div className="config-grid">
          {/* 基本設定 */}
          <div className="config-section">
            <h4>基本設定</h4>
            
            <div className="config-item">
              <label>表示名</label>
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => updateConfig(selectedRarity, 'name', e.target.value)}
                className="config-input"
              />
            </div>

            <div className="config-item">
              <label>メインカラー</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={currentConfig.color}
                  onChange={(e) => updateConfig(selectedRarity, 'color', e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={currentConfig.color}
                  onChange={(e) => updateConfig(selectedRarity, 'color', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>

            <div className="config-item">
              <label>背景色</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={currentConfig.bgColor}
                  onChange={(e) => updateConfig(selectedRarity, 'bgColor', e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={currentConfig.bgColor}
                  onChange={(e) => updateConfig(selectedRarity, 'bgColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>
          </div>

          {/* 演出設定 */}
          <div className="config-section">
            <h4>演出設定</h4>
            
            <div className="config-item">
              <label>エフェクトタイプ</label>
              <select
                value={currentConfig.effectType}
                onChange={(e) => updateConfig(selectedRarity, 'effectType', e.target.value)}
                className="config-select"
              >
                <option value="simple">シンプル</option>
                <option value="shine">キラキラ</option>
                <option value="burst">バースト</option>
                <option value="explosion">爆発</option>
                <option value="rainbow_explosion">虹色爆発</option>
                <option value="ultimate_explosion">究極爆発</option>
              </select>
            </div>

            <div className="config-item">
              <label>演出時間 (ms)</label>
              <input
                type="range"
                min="500"
                max="8000"
                step="100"
                value={currentConfig.duration}
                onChange={(e) => updateConfig(selectedRarity, 'duration', parseInt(e.target.value))}
                className="config-range"
              />
              <span className="range-value">{currentConfig.duration}ms</span>
            </div>

            <div className="config-item">
              <label>サウンドファイル</label>
              <input
                type="text"
                value={currentConfig.sound}
                onChange={(e) => updateConfig(selectedRarity, 'sound', e.target.value)}
                className="config-input"
                placeholder="/sounds/effect.mp3"
              />
            </div>
          </div>

          {/* プレビュー */}
          <div className="config-section">
            <h4>プレビュー</h4>
            <div className="preview-area">
              <div 
                className="preview-card"
                style={{
                  backgroundColor: currentConfig.bgColor,
                  border: `3px solid ${currentConfig.color}`,
                  color: currentConfig.color
                }}
              >
                <div className="preview-rarity">{selectedRarity}</div>
                <div className="preview-name">{currentConfig.name}</div>
                <div className="preview-effect">{currentConfig.effectType}</div>
                <div className="preview-duration">{currentConfig.duration}ms</div>
              </div>
              
              <button 
                className="preview-btn"
                style={{ backgroundColor: currentConfig.color }}
                onClick={() => {
                  // プレビュー再生トリガー
                  window.dispatchEvent(new CustomEvent('playEffectPreview', {
                    detail: { rarity: selectedRarity, config: currentConfig }
                  }));
                }}
              >
                🎬 プレビュー再生
              </button>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="config-actions">
          <button 
            className="save-btn"
            onClick={() => {
              localStorage.setItem('gachaEffectConfigs', JSON.stringify(configs));
              alert('設定を保存しました！');
            }}
          >
            💾 設定を保存
          </button>
          
          <button 
            className="reset-btn"
            onClick={() => {
              setConfigs(RARITY_CONFIGS);
              alert('設定をリセットしました！');
            }}
          >
            🔄 リセット
          </button>
        </div>
      </div>

      <style jsx>{`
        .effect-config {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Hiragino Kaku Gothic ProN', sans-serif;
        }

        .config-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .config-header h2 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #333;
        }

        .rarity-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .rarity-tab {
          padding: 15px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
          min-width: 120px;
        }

        .rarity-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .rarity-name {
          font-size: 18px;
          font-weight: bold;
        }

        .rarity-desc {
          font-size: 12px;
          opacity: 0.8;
        }

        .config-panel {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .config-panel h3 {
          font-size: 24px;
          margin-bottom: 25px;
          color: #333;
          text-align: center;
        }

        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .config-grid {
            grid-template-columns: 1fr;
          }
        }

        .config-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }

        .config-section h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          padding-bottom: 10px;
        }

        .config-item {
          margin-bottom: 20px;
        }

        .config-item label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #495057;
          font-size: 14px;
        }

        .config-input, .config-select {
          width: 100%;
          padding: 10px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .config-input:focus, .config-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .color-input-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .color-input {
          width: 50px;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .color-text {
          flex: 1;
          padding: 8px;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          font-family: monospace;
        }

        .config-range {
          width: 100%;
          margin: 10px 0;
        }

        .range-value {
          display: inline-block;
          margin-left: 10px;
          font-weight: bold;
          color: #007bff;
        }

        .preview-area {
          text-align: center;
        }

        .preview-card {
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 15px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .preview-rarity {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .preview-name {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .preview-effect {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 5px;
        }

        .preview-duration {
          font-size: 12px;
          opacity: 0.8;
        }

        .preview-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .preview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .config-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          padding-top: 20px;
          border-top: 2px solid #dee2e6;
        }

        .save-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .save-btn:hover {
          background: #218838;
          transform: translateY(-2px);
        }

        .reset-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .reset-btn:hover {
          background: #5a6268;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}