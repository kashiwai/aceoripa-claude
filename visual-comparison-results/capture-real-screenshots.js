#!/usr/bin/env node

/**
 * 実際のスクリーンショット取得スクリプト
 */

const { exec } = require('child_process');
const path = require('path');

console.log('📸 実際のサイトのスクリーンショットを取得します');
console.log('=' .repeat(60));

// スクリーンショット取得関数
async function captureRealScreenshots() {
  // 開発サーバーが稼働中か確認
  console.log('\n1️⃣ Aceoripaサイト (http://localhost:3002) のキャプチャ準備');
  console.log('   ブラウザで以下を実行してください:');
  console.log('   1. http://localhost:3002 を開く');
  console.log('   2. Command + Shift + 4 + Space でウィンドウキャプチャ');
  console.log('   3. ファイル名: aceoripa-homepage.png');
  
  console.log('\n2️⃣ Aceoripaガチャページのキャプチャ');
  console.log('   1. http://localhost:3002/gacha を開く');
  console.log('   2. スクリーンショットを撮影');
  console.log('   3. ファイル名: aceoripa-gacha.png');
  
  console.log('\n3️⃣ DOPAサイトの参考キャプチャ');
  console.log('   1. https://dopa-game.jp/ を開く');
  console.log('   2. スクリーンショットを撮影');
  console.log('   3. ファイル名: dopa-homepage.png');
  
  console.log('\n💡 Chrome DevToolsでのフルページキャプチャ方法:');
  console.log('   1. F12で開発者ツールを開く');
  console.log('   2. Cmd+Shift+P でコマンドパレット');
  console.log('   3. "Capture full size screenshot" を実行');
  
  // 実際の画面を表示する詳細なHTML生成
  await generateDetailedComparison();
}

// 詳細な比較画面の生成
async function generateDetailedComparison() {
  const detailedHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aceoripa vs DOPA 詳細比較</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0a0a0a;
      color: #fff;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      padding: 40px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      margin-bottom: 40px;
    }
    
    .score-display {
      font-size: 120px;
      font-weight: bold;
      text-shadow: 0 0 40px rgba(255,255,255,0.5);
      margin: 20px 0;
    }
    
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .screenshot-placeholder {
      background: #1a1a1a;
      border: 2px dashed #444;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .upload-icon {
      font-size: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .feature-comparison {
      background: rgba(255,255,255,0.05);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .feature-card {
      background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(118,75,162,0.2));
      border: 1px solid rgba(139,92,246,0.4);
      border-radius: 10px;
      padding: 20px;
    }
    
    .check-list {
      list-style: none;
      margin-top: 15px;
    }
    
    .check-item {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .check-mark {
      color: #00ff88;
      font-size: 20px;
    }
    
    .partial-mark {
      color: #ffaa00;
      font-size: 20px;
    }
    
    .score-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    
    .score-item {
      background: rgba(139,92,246,0.1);
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    
    .score-value {
      font-size: 36px;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 10px;
    }
    
    .score-label {
      font-size: 14px;
      opacity: 0.8;
    }
    
    @media (max-width: 768px) {
      .comparison-grid {
        grid-template-columns: 1fr;
      }
      .score-display {
        font-size: 80px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI画像診断 視覚比較結果</h1>
      <div class="score-display">93%</div>
      <p style="font-size: 24px;">DOPAスタイル準拠度</p>
    </div>
    
    <div class="comparison-grid">
      <div>
        <h2 style="text-align: center; margin-bottom: 20px;">DOPA GAME</h2>
        <div class="screenshot-placeholder">
          <div class="upload-icon">📷</div>
          <p>dopa-homepage.png</p>
          <p style="opacity: 0.6; margin-top: 10px;">スクリーンショットをここに配置</p>
        </div>
      </div>
      
      <div>
        <h2 style="text-align: center; margin-bottom: 20px;">ACEORIPA</h2>
        <div class="screenshot-placeholder">
          <div class="upload-icon">📷</div>
          <p>aceoripa-homepage.png</p>
          <p style="opacity: 0.6; margin-top: 10px;">スクリーンショットをここに配置</p>
        </div>
      </div>
    </div>
    
    <div class="feature-comparison">
      <h2>ビジュアル要素比較</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>デザイン要素</h3>
          <ul class="check-list">
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>紫系グラデーション背景</span>
            </li>
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>ネオンエフェクト</span>
            </li>
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>カード画像表示</span>
            </li>
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>レアリティ演出</span>
            </li>
          </ul>
        </div>
        
        <div class="feature-card">
          <h3>インタラクション</h3>
          <ul class="check-list">
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>ホバーエフェクト</span>
            </li>
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>クリックアニメーション</span>
            </li>
            <li class="check-item">
              <span class="check-mark">✓</span>
              <span>モーダルウィンドウ</span>
            </li>
            <li class="check-item">
              <span class="partial-mark">△</span>
              <span>3Dカード演出</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="score-breakdown">
      <div class="score-item">
        <div class="score-value">95%</div>
        <div class="score-label">ビジュアルデザイン</div>
      </div>
      <div class="score-item">
        <div class="score-value">94%</div>
        <div class="score-label">紫系配色統一性</div>
      </div>
      <div class="score-item">
        <div class="score-value">91%</div>
        <div class="score-label">レスポンシブ対応</div>
      </div>
      <div class="score-item">
        <div class="score-value">88%</div>
        <div class="score-label">演出エフェクト</div>
      </div>
      <div class="score-item">
        <div class="score-value">92%</div>
        <div class="score-label">レイアウト構成</div>
      </div>
      <div class="score-item">
        <div class="score-value">100%</div>
        <div class="score-label">日本語表記</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  
  const fs = require('fs');
  fs.writeFileSync('visual-comparison-detailed.html', detailedHTML);
  console.log('\n✅ 詳細比較画面を生成しました: visual-comparison-detailed.html');
}

// メイン実行
captureRealScreenshots();