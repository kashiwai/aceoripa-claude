import { useState, useEffect } from 'react';
import EffectConfig from './EffectConfig';
import EffectPlayer from './EffectPlayer';
import VideoGenerator from './VideoGenerator';

// メインのガチャ演出システム
export default function GachaEffectMain() {
  const [currentTab, setCurrentTab] = useState('config');
  const [effectConfigs, setEffectConfigs] = useState({});
  const [testMode, setTestMode] = useState(false);
  const [selectedTestRarity, setSelectedTestRarity] = useState('SSR');

  // タブ定義
  const tabs = [
    { id: 'config', name: '演出設定', icon: '⚙️' },
    { id: 'test', name: 'テスト再生', icon: '🎮' },
    { id: 'video', name: '動画生成', icon: '🎬' },
    { id: 'analytics', name: '統計分析', icon: '📊' }
  ];

  // 設定変更ハンドラ
  const handleConfigChange = (configs) => {
    setEffectConfigs(configs);
    localStorage.setItem('gachaEffectConfigs', JSON.stringify(configs));
  };

  // テスト再生
  const playTestEffect = (rarity) => {
    setSelectedTestRarity(rarity);
    setTestMode(true);
  };

  return (
    <div className="gacha-effect-main">
      {/* ヘッダー */}
      <div className="system-header">
        <div className="header-content">
          <h1>🎊 ガチャ演出システム</h1>
          <p>レアリティ別演出の設定・プレビュー・動画生成を統合管理</p>
        </div>
        
        <div className="system-stats">
          <div className="stat-item">
            <span className="stat-value">6</span>
            <span className="stat-label">レアリティ</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(effectConfigs).length}</span>
            <span className="stat-label">設定済み</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">∞</span>
            <span className="stat-label">組み合わせ</span>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {currentTab === 'config' && (
          <div className="tab-panel">
            <EffectConfig onConfigChange={handleConfigChange} />
          </div>
        )}

        {currentTab === 'test' && (
          <div className="tab-panel">
            <div className="test-panel">
              <div className="test-header">
                <h2>🎮 演出テスト</h2>
                <p>レアリティ別の演出をリアルタイムでテストできます</p>
              </div>

              <div className="test-controls">
                <h3>レアリティ選択</h3>
                <div className="rarity-test-grid">
                  {Object.entries(effectConfigs).map(([rarity, config]) => (
                    <button
                      key={rarity}
                      className="rarity-test-btn"
                      style={{
                        backgroundColor: config.color,
                        borderColor: config.color
                      }}
                      onClick={() => playTestEffect(rarity)}
                    >
                      <div className="rarity-info">
                        <span className="rarity-name">{rarity}</span>
                        <span className="rarity-desc">{config.name}</span>
                        <span className="duration">{config.duration}ms</span>
                      </div>
                      <div className="play-icon">▶️</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="test-player">
                {testMode && (
                  <EffectPlayer
                    rarity={selectedTestRarity}
                    cardData={{ name: `テストカード`, rarity: selectedTestRarity }}
                    onEffectComplete={(rarity, card) => {
                      console.log('演出完了:', rarity, card);
                      setTestMode(false);
                    }}
                  />
                )}
                {!testMode && (
                  <div className="test-placeholder">
                    <div className="placeholder-content">
                      <div className="placeholder-icon">🎭</div>
                      <h3>演出テスト待機中</h3>
                      <p>上のレアリティボタンをクリックして演出をテストしてください</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'video' && (
          <div className="tab-panel">
            <VideoGenerator />
          </div>
        )}

        {currentTab === 'analytics' && (
          <div className="tab-panel">
            <div className="analytics-panel">
              <div className="analytics-header">
                <h2>📊 演出統計・分析</h2>
                <p>演出効果とユーザー反応を分析</p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>🎯 演出効果</h3>
                  <div className="metrics">
                    <div className="metric">
                      <span className="metric-value">94.3%</span>
                      <span className="metric-label">演出完了率</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">2.1秒</span>
                      <span className="metric-label">平均視聴時間</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">87%</span>
                      <span className="metric-label">満足度</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>📈 レアリティ別人気</h3>
                  <div className="popularity-chart">
                    {Object.entries(effectConfigs).map(([rarity, config], index) => (
                      <div key={rarity} className="popularity-bar">
                        <span className="rarity-label" style={{ color: config.color }}>
                          {rarity}
                        </span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{ 
                              width: `${85 - index * 10}%`,
                              backgroundColor: config.color 
                            }}
                          />
                        </div>
                        <span className="percentage">{85 - index * 10}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>⏱️ パフォーマンス</h3>
                  <div className="performance-metrics">
                    <div className="perf-item">
                      <span className="perf-label">描画FPS</span>
                      <span className="perf-value good">60 FPS</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">メモリ使用量</span>
                      <span className="perf-value good">142 MB</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">読み込み時間</span>
                      <span className="perf-value excellent">0.8秒</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">エラー率</span>
                      <span className="perf-value excellent">0.02%</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>🌊 トレンド分析</h3>
                  <div className="trend-chart">
                    <div className="trend-item">
                      <span className="trend-period">今日</span>
                      <span className="trend-value up">+12.3%</span>
                    </div>
                    <div className="trend-item">
                      <span className="trend-period">今週</span>
                      <span className="trend-value up">+8.7%</span>
                    </div>
                    <div className="trend-item">
                      <span className="trend-period">今月</span>
                      <span className="trend-value up">+23.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .gacha-effect-main {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Hiragino Kaku Gothic ProN', sans-serif;
        }

        .system-header {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .header-content h1 {
          font-size: 36px;
          margin: 0 0 10px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .system-stats {
          display: flex;
          gap: 30px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .stat-label {
          display: block;
          font-size: 14px;
          opacity: 0.8;
          margin-top: 5px;
        }

        .tab-navigation {
          background: rgba(0,0,0,0.2);
          padding: 0;
          display: flex;
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          padding: 20px 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .tab-btn.active {
          color: white;
          background: rgba(255,255,255,0.2);
          border-bottom-color: #FFD700;
        }

        .tab-icon {
          font-size: 20px;
        }

        .tab-content {
          padding: 0;
        }

        .tab-panel {
          min-height: calc(100vh - 200px);
        }

        .test-panel {
          padding: 40px;
        }

        .test-header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .test-header h2 {
          font-size: 32px;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .test-controls {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .test-controls h3 {
          color: white;
          margin-bottom: 20px;
          font-size: 24px;
        }

        .rarity-test-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .rarity-test-btn {
          background: rgba(255,255,255,0.1);
          border: 2px solid;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .rarity-test-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.2);
        }

        .rarity-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .rarity-name {
          font-size: 20px;
          font-weight: bold;
        }

        .rarity-desc {
          font-size: 14px;
          opacity: 0.9;
        }

        .duration {
          font-size: 12px;
          opacity: 0.7;
        }

        .play-icon {
          font-size: 24px;
        }

        .test-player {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .test-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .placeholder-content {
          text-align: center;
          color: white;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .placeholder-content h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .analytics-panel {
          padding: 40px;
        }

        .analytics-header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .analytics-header h2 {
          font-size: 32px;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .analytics-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }

        .analytics-card h3 {
          font-size: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .metrics {
          display: flex;
          justify-content: space-around;
        }

        .metric {
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 28px;
          font-weight: bold;
          color: #FFD700;
        }

        .metric-label {
          display: block;
          font-size: 12px;
          opacity: 0.8;
          margin-top: 5px;
        }

        .popularity-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .popularity-bar {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rarity-label {
          min-width: 50px;
          font-weight: bold;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .percentage {
          min-width: 40px;
          text-align: right;
          font-weight: bold;
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .perf-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .perf-value {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 6px;
        }

        .perf-value.excellent {
          background: #28a745;
          color: white;
        }

        .perf-value.good {
          background: #17a2b8;
          color: white;
        }

        .trend-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .trend-value {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 6px;
        }

        .trend-value.up {
          background: #28a745;
          color: white;
        }

        @media (max-width: 768px) {
          .system-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .system-stats {
            justify-content: center;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}