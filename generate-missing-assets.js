// 足りていない画像・アイコン生成システム
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// 必要なアセットリスト
const MISSING_ASSETS = {
  // ガチャボタン
  gachaButtons: {
    single: {
      name: '1回ガチャ',
      size: { width: 300, height: 80 },
      color: '#FF6B6B',
      icon: '🎰',
      text: '1回ガチャ'
    },
    ten: {
      name: '10連ガチャ',
      size: { width: 300, height: 80 },
      color: '#4ECDC4',
      icon: '🎰×10',
      text: '10連ガチャ'
    },
    custom: {
      name: '指定数ガチャ',
      size: { width: 600, height: 100 },
      color: '#FFD93D',
      icon: '🎰',
      text: '指定数ガチャ\n(何回でもOK)'
    }
  },

  // レアリティアイコン
  rarityIcons: {
    N: { color: '#808080', star: '⭐', count: 1 },
    R: { color: '#0080FF', star: '⭐', count: 2 },
    SR: { color: '#FFD700', star: '⭐', count: 3 },
    SSR: { color: '#FF69B4', star: '⭐', count: 4 },
    SS: { color: '#FF4500', star: '⭐', count: 5 },
    PSA10: { color: '#8B00FF', star: '💎', count: 1 }
  },

  // UI要素
  uiElements: {
    // カード枠
    cardFrames: {
      normal: { color: '#C0C0C0', glow: false },
      rare: { color: '#0080FF', glow: true },
      superRare: { color: '#FFD700', glow: true },
      ultraRare: { color: '#FF69B4', glow: true }
    },
    
    // ローディングスピナー
    loadingSpinner: {
      size: 100,
      color: '#FFD700'
    },

    // 結果画面ボタン
    resultButtons: {
      retry: {
        text: 'もう一度',
        icon: '🔄',
        color: '#4CAF50'
      },
      share: {
        text: 'シェア',
        icon: '📤',
        color: '#2196F3'
      },
      save: {
        text: '保存',
        icon: '💾',
        color: '#FF9800'
      }
    }
  },

  // ポケモンカード代替画像
  pokemonCards: {
    pikachu: {
      name: 'ピカチュウ',
      rarity: 'SSR',
      type: '電気',
      hp: 120,
      color: '#FFD700'
    },
    charizard: {
      name: 'リザードン',
      rarity: 'SS',
      type: '炎',
      hp: 200,
      color: '#FF4500'
    },
    mewtwo: {
      name: 'ミュウツー',
      rarity: 'PSA10',
      type: 'エスパー',
      hp: 180,
      color: '#8B00FF'
    },
    eevee: {
      name: 'イーブイ',
      rarity: 'SR',
      type: 'ノーマル',
      hp: 90,
      color: '#D2691E'
    },
    mew: {
      name: 'ミュウ',
      rarity: 'SSR',
      type: 'エスパー',
      hp: 100,
      color: '#FF69B4'
    }
  },

  // 背景パターン
  backgrounds: {
    gradient1: {
      colors: ['#667eea', '#764ba2'],
      angle: 135
    },
    gradient2: {
      colors: ['#f093fb', '#f5576c'],
      angle: 135
    },
    gradient3: {
      colors: ['#4facfe', '#00f2fe'],
      angle: 135
    },
    gradient4: {
      colors: ['#43e97b', '#38f9d7'],
      angle: 135
    },
    gradient5: {
      colors: ['#fa709a', '#fee140'],
      angle: 135
    }
  },

  // エフェクトオーバーレイ
  effects: {
    sparkle: {
      count: 50,
      color: '#FFD700',
      size: [2, 8]
    },
    lightning: {
      color: '#00BFFF',
      width: [2, 5]
    },
    fire: {
      colors: ['#FF4500', '#FFD700', '#FF6347'],
      particles: 30
    }
  }
};

// ガチャボタン生成
async function generateGachaButton(config, outputPath) {
  const canvas = createCanvas(config.size.width, config.size.height);
  const ctx = canvas.getContext('2d');

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, config.size.width, config.size.height);
  gradient.addColorStop(0, config.color);
  gradient.addColorStop(1, adjustColor(config.color, -30));
  
  // ボタン本体
  ctx.fillStyle = gradient;
  ctx.strokeStyle = adjustColor(config.color, -50);
  ctx.lineWidth = 3;
  roundRect(ctx, 0, 0, config.size.width, config.size.height, 20);
  ctx.fill();
  ctx.stroke();

  // 光沢効果
  const glossGradient = ctx.createLinearGradient(0, 0, 0, config.size.height * 0.5);
  glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGradient;
  roundRect(ctx, 3, 3, config.size.width - 6, config.size.height * 0.5, 18);
  ctx.fill();

  // テキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const lines = config.text.split('\n');
  const fontSize = lines.length > 1 ? 20 : 28;
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  
  lines.forEach((line, index) => {
    const y = config.size.height / 2 + (index - (lines.length - 1) / 2) * (fontSize + 5);
    ctx.strokeText(line, config.size.width / 2, y);
    ctx.fillText(line, config.size.width / 2, y);
  });

  // アイコン
  if (config.icon) {
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(config.icon, 30, config.size.height / 2);
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ガチャボタン生成: ${outputPath}`);
}

// レアリティアイコン生成
async function generateRarityIcon(rarity, config, outputPath) {
  const size = 200;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景（円形）
  ctx.fillStyle = config.color;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI * 2);
  ctx.fill();

  // 外枠
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.stroke();

  // 星
  ctx.font = `${size/config.count/2}px sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (config.count === 1) {
    ctx.font = `${size/2}px sans-serif`;
    ctx.fillText(config.star, size/2, size/2);
  } else {
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2 - Math.PI/2;
      const x = size/2 + Math.cos(angle) * size/3;
      const y = size/2 + Math.sin(angle) * size/3;
      ctx.fillText(config.star, x, y);
    }
  }

  // レアリティテキスト
  ctx.font = `bold 24px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText(rarity, size/2, size - 30);
  ctx.fillText(rarity, size/2, size - 30);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ レアリティアイコン生成: ${outputPath}`);
}

// ポケモンカード風画像生成
async function generatePokemonCard(name, config, outputPath) {
  const width = 400;
  const height = 560;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // カード背景
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, config.color);
  bgGradient.addColorStop(1, adjustColor(config.color, -20));
  ctx.fillStyle = bgGradient;
  roundRect(ctx, 0, 0, width, height, 20);
  ctx.fill();

  // カード枠
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  roundRect(ctx, 10, 10, width - 20, height - 20, 15);
  ctx.stroke();

  // 内側の枠
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, width - 40, height - 40, 10);
  ctx.stroke();

  // カード画像エリア
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, 30, 60, width - 60, 200, 10);
  ctx.fill();

  // ポケモン名
  ctx.font = 'bold 36px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.strokeText(config.name, width/2, 40);
  ctx.fillText(config.name, width/2, 40);

  // HP
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FF0000';
  ctx.fillText(`HP ${config.hp}`, width - 40, 40);

  // タイプ
  ctx.font = '20px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`タイプ: ${config.type}`, 30, 290);

  // 技
  ctx.font = '18px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillText('わざ1: でんきショック 30', 30, 330);
  ctx.fillText('わざ2: かみなり 100', 30, 360);

  // レアリティマーク
  const raritySize = 60;
  ctx.fillStyle = MISSING_ASSETS.rarityIcons[config.rarity].color;
  ctx.beginPath();
  ctx.arc(width - 50, height - 50, raritySize/2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(config.rarity, width - 50, height - 45);

  // キラキラエフェクト
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ポケモンカード生成: ${outputPath}`);
}

// UI要素生成
async function generateUIElement(type, config, outputPath) {
  let canvas, ctx;

  switch (type) {
    case 'loadingSpinner':
      canvas = createCanvas(config.size, config.size);
      ctx = canvas.getContext('2d');
      
      // スピナー本体
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = config.size/2 + Math.cos(angle) * config.size/3;
        const y1 = config.size/2 + Math.sin(angle) * config.size/3;
        const x2 = config.size/2 + Math.cos(angle) * config.size/2.2;
        const y2 = config.size/2 + Math.sin(angle) * config.size/2.2;
        
        ctx.globalAlpha = 1 - (i / 8) * 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      break;

    case 'resultButton':
      canvas = createCanvas(200, 60);
      ctx = canvas.getContext('2d');
      
      // ボタン背景
      ctx.fillStyle = config.color;
      roundRect(ctx, 0, 0, 200, 60, 15);
      ctx.fill();
      
      // テキスト
      ctx.font = 'bold 20px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${config.icon} ${config.text}`, 100, 30);
      break;
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ UI要素生成: ${outputPath}`);
}

// 背景パターン生成
async function generateBackground(config, outputPath) {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  // グラデーション背景
  const gradient = ctx.createLinearGradient(
    0, 0,
    Math.cos(config.angle * Math.PI / 180) * 1920,
    Math.sin(config.angle * Math.PI / 180) * 1080
  );
  
  config.colors.forEach((color, index) => {
    gradient.addColorStop(index / (config.colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  // パターンオーバーレイ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let x = 0; x < 1920; x += 100) {
    for (let y = 0; y < 1080; y += 100) {
      if ((x + y) % 200 === 0) {
        ctx.fillRect(x, y, 50, 50);
      }
    }
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 背景生成: ${outputPath}`);
}

// ヘルパー関数
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// メイン実行関数
async function generateMissingAssets() {
  console.log('🎨 足りていないアセット生成開始...\n');

  // 出力ディレクトリ作成
  const dirs = [
    'public/images/gacha-buttons',
    'public/images/rarity-icons',
    'public/images/pokemon-cards',
    'public/images/ui-elements',
    'public/images/backgrounds',
    'public/images/effects'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 1. ガチャボタン生成
  console.log('\n📱 ガチャボタン生成中...');
  for (const [key, config] of Object.entries(MISSING_ASSETS.gachaButtons)) {
    await generateGachaButton(config, `public/images/gacha-buttons/${key}-button.png`);
  }

  // 2. レアリティアイコン生成
  console.log('\n⭐ レアリティアイコン生成中...');
  for (const [rarity, config] of Object.entries(MISSING_ASSETS.rarityIcons)) {
    await generateRarityIcon(rarity, config, `public/images/rarity-icons/${rarity}-icon.png`);
  }

  // 3. ポケモンカード風画像生成
  console.log('\n🃏 ポケモンカード生成中...');
  for (const [key, config] of Object.entries(MISSING_ASSETS.pokemonCards)) {
    await generatePokemonCard(key, config, `public/images/pokemon-cards/${key}-card.png`);
  }

  // 4. UI要素生成
  console.log('\n🎯 UI要素生成中...');
  await generateUIElement('loadingSpinner', MISSING_ASSETS.uiElements.loadingSpinner, 
    'public/images/ui-elements/loading-spinner.png');
  
  for (const [key, config] of Object.entries(MISSING_ASSETS.uiElements.resultButtons)) {
    await generateUIElement('resultButton', config, 
      `public/images/ui-elements/${key}-button.png`);
  }

  // 5. 背景生成
  console.log('\n🌈 背景パターン生成中...');
  for (const [key, config] of Object.entries(MISSING_ASSETS.backgrounds)) {
    await generateBackground(config, `public/images/backgrounds/${key}.png`);
  }

  console.log('\n\n✅ 全アセット生成完了！');
  console.log('========================');
  console.log('\n📂 生成されたアセット:');
  console.log('- ガチャボタン: 3種類');
  console.log('- レアリティアイコン: 6種類');
  console.log('- ポケモンカード: 5種類');
  console.log('- UI要素: 4種類');
  console.log('- 背景: 5種類');
  console.log('\n合計: 23個の新規アセット');
}

// 実行
generateMissingAssets().catch(console.error);