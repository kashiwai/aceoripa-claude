const fs = require('fs').promises;
const path = require('path');

// DOPA風ガチャバナー5種類生成スクリプト

const bannerConfigs = [
  {
    id: 'pokemon-151-oripa',
    title: 'ポケモンカード151オリパ',
    subtitle: 'リザードンex SAR確率UP！',
    type: 'dopa-pokemon',
    filename: 'pokemon-151-gacha-banner.png'
  },
  {
    id: 'onepiece-premium',
    title: 'ワンピース頂上決戦',
    subtitle: 'ルフィSEC確定パック',
    type: 'dopa-main',
    filename: 'onepiece-premium-banner.png'
  },
  {
    id: 'yugioh-rarity',
    title: '遊戯王レアコレ',
    subtitle: 'ブルーアイズ究極竜',
    type: 'dopa-campaign',
    filename: 'yugioh-rarity-banner.png'
  },
  {
    id: 'limited-campaign',
    title: '期間限定キャンペーン',
    subtitle: '全商品50%OFF中',
    type: 'dopa-campaign',
    filename: 'limited-campaign-banner.png'
  },
  {
    id: 'sns-winner-report',
    title: '大当たり報告続出',
    subtitle: 'SNS投稿でさらにお得',
    type: 'dopa-winner',
    filename: 'sns-winner-banner.png'
  }
];

async function generateDopaBanner(config) {
  console.log(`🎨 生成中: ${config.title}`);
  
  try {
    // Next.js APIを使用してバナー生成
    const response = await fetch('http://localhost:9012/api/generate-banner-imagen4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: config.type,
        title: config.title,
        subtitle: config.subtitle,
        style: 'premium',
        dimensions: '16:9'
      }),
    });

    if (!response.ok) {
      console.error(`❌ API エラー: ${response.status}`);
      // フォールバック: 画像生成サーバーを使用
      return await generateWithImageServer(config);
    }

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      console.log(`✅ 成功: ${config.title}`);
      console.log(`   エンジン: ${data.engine}`);
      console.log(`   URL: ${data.imageUrl}`);
      
      return {
        ...config,
        imageUrl: data.imageUrl,
        engine: data.engine,
        metadata: data.metadata
      };
    } else {
      throw new Error(data.error || 'バナー生成失敗');
    }
    
  } catch (error) {
    console.error(`❌ エラー (${config.title}):`, error.message);
    // フォールバック: 画像生成サーバーを使用
    return await generateWithImageServer(config);
  }
}

async function generateWithImageServer(config) {
  console.log(`🔄 フォールバック (${config.title}): 画像サーバー使用`);
  
  try {
    const response = await fetch('http://localhost:9015/generate-banner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: `dopa-${config.type.replace('dopa-', '')}`,
        title: config.title,
        subtitle: config.subtitle,
        style: 'premium',
        width: 800,
        height: 450
      }),
    });

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      console.log(`✅ フォールバック成功: ${config.title}`);
      return {
        ...config,
        imageUrl: data.imageUrl,
        engine: 'canvas-server',
        fallback: true
      };
    } else {
      throw new Error('画像サーバーエラー');
    }
    
  } catch (error) {
    console.error(`❌ フォールバックエラー (${config.title}):`, error.message);
    
    // 最終フォールバック: プレースホルダー
    return {
      ...config,
      imageUrl: `/api/placeholder/800/450?text=${encodeURIComponent(config.title)}`,
      engine: 'placeholder',
      fallback: true,
      error: error.message
    };
  }
}

async function saveGeneratedBanners(results) {
  console.log('\n📁 バナー保存中...');
  
  const publicDir = path.join(process.cwd(), 'public', 'images', 'gacha-banners');
  
  try {
    // ディレクトリ作成
    await fs.mkdir(publicDir, { recursive: true });
    
    // 結果をJSONファイルに保存
    const resultData = {
      generated_at: new Date().toISOString(),
      banners: results,
      summary: {
        total: results.length,
        success: results.filter(r => !r.error).length,
        fallback: results.filter(r => r.fallback).length,
        error: results.filter(r => r.error).length
      }
    };
    
    const jsonPath = path.join(publicDir, 'banner-generation-results.json');
    await fs.writeFile(jsonPath, JSON.stringify(resultData, null, 2));
    
    console.log(`✅ 結果保存: ${jsonPath}`);
    
    // HTMLプレビューページ作成
    const htmlContent = generatePreviewHTML(results);
    const htmlPath = path.join(publicDir, 'preview.html');
    await fs.writeFile(htmlPath, htmlContent);
    
    console.log(`✅ プレビュー作成: ${htmlPath}`);
    
    return resultData;
    
  } catch (error) {
    console.error('❌ 保存エラー:', error.message);
    return null;
  }
}

function generatePreviewHTML(results) {
  const bannerHTML = results.map(result => `
    <div class="banner-card">
      <h3>${result.title}</h3>
      <p class="subtitle">${result.subtitle}</p>
      <div class="banner-image">
        <img src="${result.imageUrl}" alt="${result.title}" onerror="this.src='/api/placeholder/800/450?text=Error'">
        <div class="engine-badge">${result.engine}</div>
        ${result.fallback ? '<div class="fallback-badge">フォールバック</div>' : ''}
      </div>
      <div class="details">
        <p><strong>タイプ:</strong> ${result.type}</p>
        <p><strong>ファイル:</strong> ${result.filename}</p>
        ${result.metadata ? `<p><strong>品質:</strong> ${result.metadata.quality}</p>` : ''}
        ${result.error ? `<p class="error"><strong>エラー:</strong> ${result.error}</p>` : ''}
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOPA風ガチャバナー5種類 - プレビュー</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Noto Sans JP', sans-serif; 
            background: linear-gradient(135deg, #FF0033, #FF6B6B);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        h1 { 
            text-align: center; 
            color: #FF0033; 
            margin-bottom: 40px;
            font-size: 2.5rem;
            font-weight: 900;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #FF0033;
        }
        .banner-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 30px; 
        }
        .banner-card {
            border: 3px solid #FF0033;
            border-radius: 15px;
            padding: 20px;
            background: white;
            box-shadow: 0 10px 30px rgba(255,0,51,0.1);
            transition: transform 0.3s ease;
        }
        .banner-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(255,0,51,0.2);
        }
        .banner-card h3 {
            color: #FF0033;
            margin-bottom: 8px;
            font-size: 1.3rem;
            font-weight: bold;
        }
        .subtitle {
            color: #666;
            margin-bottom: 15px;
            font-weight: 500;
        }
        .banner-image {
            position: relative;
            margin-bottom: 15px;
            border-radius: 10px;
            overflow: hidden;
        }
        .banner-image img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 10px;
        }
        .engine-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .fallback-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255,193,7,0.9);
            color: black;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .details p {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        .error {
            color: #dc3545;
            font-weight: bold;
        }
        .timestamp {
            text-align: center;
            margin-top: 40px;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 DOPA風ガチャバナー5種類</h1>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${results.length}</div>
                <div>総数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${results.filter(r => !r.error).length}</div>
                <div>成功</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${results.filter(r => r.fallback).length}</div>
                <div>フォールバック</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${results.filter(r => r.error).length}</div>
                <div>エラー</div>
            </div>
        </div>
        
        <div class="banner-grid">
            ${bannerHTML}
        </div>
        
        <div class="timestamp">
            生成日時: ${new Date().toLocaleString('ja-JP')}
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  console.log('🚀 DOPA風ガチャバナー5種類生成開始\n');
  
  const results = [];
  
  // 各バナーを順次生成
  for (const config of bannerConfigs) {
    const result = await generateDopaBanner(config);
    results.push(result);
    
    // 生成間隔を空ける（API制限対策）
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 生成結果サマリー:');
  console.log(`   総数: ${results.length}`);
  console.log(`   成功: ${results.filter(r => !r.error).length}`);
  console.log(`   フォールバック: ${results.filter(r => r.fallback).length}`);
  console.log(`   エラー: ${results.filter(r => r.error).length}`);
  
  // 結果を保存
  const savedData = await saveGeneratedBanners(results);
  
  if (savedData) {
    console.log('\n🎉 DOPA風ガチャバナー5種類生成完了！');
    console.log('📁 保存場所: /public/images/gacha-banners/');
    console.log('🌐 プレビュー: http://localhost:9012/images/gacha-banners/preview.html');
  }
  
  return results;
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDopaBanner, bannerConfigs };