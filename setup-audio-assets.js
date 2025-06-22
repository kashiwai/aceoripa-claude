// ガチャ演出用音源セットアップシステム
import fs from 'fs';
import https from 'https';

// 音源ディレクトリ構造
const AUDIO_DIRS = {
  bgm: 'public/audio/bgm',
  sfx: 'public/audio/sfx',
  voice: 'public/audio/voice'
};

// 必要な音源リスト（フリー音源サイトからダウンロード）
const AUDIO_ASSETS = {
  bgm: {
    // 8秒間のループBGM
    explosion: {
      name: 'epic-explosion.mp3',
      description: 'エピックで壮大な爆発演出BGM',
      source: '魔王魂または甘茶の音楽工房',
      duration: 8,
      loopable: true
    },
    galaxy: {
      name: 'cosmic-galaxy.mp3',
      description: '宇宙的で神秘的な銀河演出BGM',
      source: 'DOVA-SYNDROME',
      duration: 8,
      loopable: true
    },
    lightning: {
      name: 'thunder-storm.mp3',
      description: '電気的でパワフルな雷撃演出BGM',
      source: '魔王魂',
      duration: 8,
      loopable: true
    },
    fire: {
      name: 'burning-flame.mp3',
      description: '熱く激しい炎演出BGM',
      source: 'OtoLogic',
      duration: 8,
      loopable: true
    },
    rainbow: {
      name: 'magical-rainbow.mp3',
      description: '幻想的な虹色演出BGM',
      source: '甘茶の音楽工房',
      duration: 8,
      loopable: true
    }
  },
  sfx: {
    // 爆発音
    explosionLarge: {
      name: 'explosion-huge.mp3',
      description: '大爆発音',
      source: '効果音ラボ',
      timing: 3.0
    },
    explosionMedium: {
      name: 'explosion-medium.mp3',
      description: '中爆発音',
      source: '効果音ラボ',
      timing: 2.0
    },
    explosionSmall: {
      name: 'explosion-small.mp3',
      description: '小爆発音',
      source: '効果音ラボ',
      timing: 1.0
    },
    
    // チャージ・ビルドアップ
    chargeUp: {
      name: 'charge-up.mp3',
      description: 'エネルギーチャージ音',
      source: '効果音ラボ',
      timing: 0.5
    },
    powerUp: {
      name: 'power-up.mp3',
      description: 'パワーアップ音',
      source: '効果音ラボ',
      timing: 1.5
    },
    
    // キラキラ・成功音
    sparkle: {
      name: 'sparkle-burst.mp3',
      description: 'キラキラ音',
      source: '効果音ラボ',
      timing: 4.5
    },
    success: {
      name: 'success-fanfare.mp3',
      description: '成功ファンファーレ',
      source: '魔王魂',
      timing: 6.0
    },
    
    // 雷撃音
    thunder: {
      name: 'thunder-strike.mp3',
      description: '雷撃音',
      source: '効果音ラボ',
      timing: 2.5
    },
    electric: {
      name: 'electric-surge.mp3',
      description: '電撃音',
      source: '効果音ラボ',
      timing: 3.0
    },
    
    // 炎音
    fireBlast: {
      name: 'fire-blast.mp3',
      description: '炎の爆発音',
      source: '効果音ラボ',
      timing: 2.0
    },
    fireWhoosh: {
      name: 'fire-whoosh.mp3',
      description: '炎の風切り音',
      source: '効果音ラボ',
      timing: 1.5
    },
    
    // カード出現
    cardReveal: {
      name: 'card-reveal.mp3',
      description: 'カード出現音',
      source: '効果音ラボ',
      timing: 4.0
    },
    cardFlip: {
      name: 'card-flip.mp3',
      description: 'カードめくり音',
      source: '効果音ラボ',
      timing: 4.2
    },
    
    // その他演出音
    woosh: {
      name: 'woosh.mp3',
      description: '風切り音',
      source: '効果音ラボ',
      timing: 0.8
    },
    impact: {
      name: 'impact.mp3',
      description: 'インパクト音',
      source: '効果音ラボ',
      timing: 3.5
    }
  },
  voice: {
    // 日本語ボイス（Text-to-Speechで生成予定）
    ultraRare: {
      name: 'voice-ultra-rare.mp3',
      text: '超激レア！',
      description: '超激レアボイス'
    },
    jackpot: {
      name: 'voice-jackpot.mp3',
      text: '大当たり！',
      description: '大当たりボイス'
    },
    ssrConfirmed: {
      name: 'voice-ssr-confirmed.mp3',
      text: 'SSR確定！',
      description: 'SSR確定ボイス'
    },
    congratulations: {
      name: 'voice-congratulations.mp3',
      text: 'おめでとうございます！',
      description: 'おめでとうボイス'
    }
  }
};

// 音源クレジット情報
const AUDIO_CREDITS = {
  '効果音ラボ': {
    url: 'https://soundeffect-lab.info/',
    credit: false, // クレジット表記不要
    commercial: true
  },
  '魔王魂': {
    url: 'https://maou.audio/',
    credit: true, // クレジット表記必須
    creditText: '音楽：魔王魂',
    commercial: true
  },
  'DOVA-SYNDROME': {
    url: 'https://dova-s.jp/',
    credit: false, // 作曲者による
    commercial: true,
    note: '作曲者ごとの利用条件を確認'
  },
  '甘茶の音楽工房': {
    url: 'https://amachamusic.chagasi.com/',
    credit: false, // クレジット表記不要
    commercial: true
  },
  'OtoLogic': {
    url: 'https://otologic.jp/',
    credit: true, // クレジット表記必須
    creditText: 'OtoLogic',
    commercial: true
  }
};

// 音源組み合わせテンプレート
const AUDIO_TEMPLATES = {
  explosion_ssr: {
    name: 'SSR爆発演出',
    bgm: 'epic-explosion.mp3',
    sfx: [
      { file: 'charge-up.mp3', time: 0.5 },
      { file: 'power-up.mp3', time: 1.5 },
      { file: 'explosion-huge.mp3', time: 3.0 },
      { file: 'sparkle-burst.mp3', time: 4.5 },
      { file: 'card-reveal.mp3', time: 4.0 },
      { file: 'success-fanfare.mp3', time: 6.0 }
    ],
    voice: [
      { file: 'voice-ultra-rare.mp3', time: 4.5 }
    ]
  },
  galaxy_ss: {
    name: 'SS銀河演出',
    bgm: 'cosmic-galaxy.mp3',
    sfx: [
      { file: 'woosh.mp3', time: 0.8 },
      { file: 'charge-up.mp3', time: 1.5 },
      { file: 'sparkle-burst.mp3', time: 3.0 },
      { file: 'card-reveal.mp3', time: 4.0 },
      { file: 'impact.mp3', time: 5.0 }
    ],
    voice: [
      { file: 'voice-ssr-confirmed.mp3', time: 4.2 }
    ]
  },
  lightning_psa10: {
    name: 'PSA10雷撃演出',
    bgm: 'thunder-storm.mp3',
    sfx: [
      { file: 'thunder-strike.mp3', time: 0.5 },
      { file: 'electric-surge.mp3', time: 2.0 },
      { file: 'thunder-strike.mp3', time: 3.0 },
      { file: 'card-reveal.mp3', time: 4.0 },
      { file: 'success-fanfare.mp3', time: 6.0 }
    ],
    voice: [
      { file: 'voice-jackpot.mp3', time: 4.5 },
      { file: 'voice-congratulations.mp3', time: 6.5 }
    ]
  },
  fire_sr: {
    name: 'SR炎演出',
    bgm: 'burning-flame.mp3',
    sfx: [
      { file: 'fire-whoosh.mp3', time: 0.5 },
      { file: 'fire-blast.mp3', time: 2.0 },
      { file: 'explosion-medium.mp3', time: 3.0 },
      { file: 'card-flip.mp3', time: 4.2 },
      { file: 'sparkle-burst.mp3', time: 5.0 }
    ],
    voice: [
      { file: 'voice-ultra-rare.mp3', time: 4.5 }
    ]
  }
};

// ディレクトリ作成
async function setupAudioDirectories() {
  console.log('🎵 音源ディレクトリ作成中...\n');
  
  Object.values(AUDIO_DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ ディレクトリ作成: ${dir}`);
    }
  });
}

// 音源設定ファイル生成
async function generateAudioConfig() {
  console.log('\n📝 音源設定ファイル生成中...');
  
  const audioConfig = {
    bgm: AUDIO_ASSETS.bgm,
    sfx: AUDIO_ASSETS.sfx,
    voice: AUDIO_ASSETS.voice,
    templates: AUDIO_TEMPLATES,
    credits: AUDIO_CREDITS
  };
  
  // 設定ファイル保存
  fs.writeFileSync(
    'public/audio/audio-config.json',
    JSON.stringify(audioConfig, null, 2)
  );
  
  console.log('✅ 設定ファイル保存: public/audio/audio-config.json');
}

// ダウンロードガイド生成
async function generateDownloadGuide() {
  console.log('\n📚 音源ダウンロードガイド生成中...');
  
  let guideContent = `# ガチャ演出音源ダウンロードガイド

## 🎵 必要な音源リスト

### BGM（背景音楽）
`;

  // BGMリスト
  Object.entries(AUDIO_ASSETS.bgm).forEach(([key, bgm]) => {
    guideContent += `
#### ${bgm.description}
- ファイル名: ${bgm.name}
- 推奨サイト: ${bgm.source}
- 長さ: ${bgm.duration}秒（ループ対応）
- 保存先: ${AUDIO_DIRS.bgm}/${bgm.name}
`;
  });

  guideContent += `\n### 効果音\n`;

  // 効果音リスト
  Object.entries(AUDIO_ASSETS.sfx).forEach(([key, sfx]) => {
    guideContent += `
#### ${sfx.description}
- ファイル名: ${sfx.name}
- 推奨サイト: ${sfx.source}
- タイミング: ${sfx.timing}秒
- 保存先: ${AUDIO_DIRS.sfx}/${sfx.name}
`;
  });

  guideContent += `
## 📥 ダウンロード手順

### 1. 効果音ラボ（効果音）
1. https://soundeffect-lab.info/ にアクセス
2. カテゴリから必要な音を探す
   - 戦闘音 → 爆発音
   - 演出・アニメ → キラキラ音、成功音
3. 左クリックでダウンロード

### 2. 魔王魂（BGM・効果音）
1. https://maou.audio/ にアクセス
2. フリー音楽素材から探す
3. **クレジット表記必須**: "音楽：魔王魂"

### 3. 甘茶の音楽工房（BGM）
1. https://amachamusic.chagasi.com/ にアクセス
2. ジャンルから選択（クレジット表記不要）

## ⚖️ 利用規約

### クレジット表記が必要なサイト
- 魔王魂: "音楽：魔王魂"
- OtoLogic: "OtoLogic"

### クレジット表記不要なサイト
- 効果音ラボ
- 甘茶の音楽工房
- DOVA-SYNDROME（作曲者による）

## 🎮 音源組み合わせテンプレート
`;

  // テンプレート情報
  Object.entries(AUDIO_TEMPLATES).forEach(([key, template]) => {
    guideContent += `\n### ${template.name}\n`;
    guideContent += `- BGM: ${template.bgm}\n`;
    guideContent += `- 効果音タイムライン:\n`;
    template.sfx.forEach(sfx => {
      guideContent += `  - ${sfx.time}秒: ${sfx.file}\n`;
    });
    if (template.voice) {
      guideContent += `- ボイス:\n`;
      template.voice.forEach(voice => {
        guideContent += `  - ${voice.time}秒: ${voice.file}\n`;
      });
    }
  });

  fs.writeFileSync('audio-download-guide.md', guideContent);
  console.log('✅ ガイド保存: audio-download-guide.md');
}

// サンプル音源プレースホルダー作成
async function createPlaceholders() {
  console.log('\n🎯 プレースホルダーファイル作成中...');
  
  const placeholderContent = '// この位置に実際の音源ファイルを配置してください';
  
  // BGMプレースホルダー
  Object.values(AUDIO_ASSETS.bgm).forEach(bgm => {
    const placeholderPath = `${AUDIO_DIRS.bgm}/${bgm.name}.placeholder`;
    fs.writeFileSync(placeholderPath, placeholderContent);
  });
  
  // 効果音プレースホルダー
  Object.values(AUDIO_ASSETS.sfx).forEach(sfx => {
    const placeholderPath = `${AUDIO_DIRS.sfx}/${sfx.name}.placeholder`;
    fs.writeFileSync(placeholderPath, placeholderContent);
  });
  
  console.log('✅ プレースホルダー作成完了');
}

// メイン実行関数
async function setupAudioAssets() {
  console.log('🚀 ガチャ演出音源セットアップ開始...\n');
  
  await setupAudioDirectories();
  await generateAudioConfig();
  await generateDownloadGuide();
  await createPlaceholders();
  
  console.log('\n\n📊 セットアップ完了！');
  console.log('====================');
  console.log('\n次のステップ:');
  console.log('1. audio-download-guide.md を参照して音源をダウンロード');
  console.log('2. ダウンロードした音源を適切なフォルダに配置');
  console.log('3. 必要に応じて音源を編集（8秒ループ化など）');
  console.log('4. クレジット表記が必要なサイトは記載を忘れずに');
  
  console.log('\n📂 ディレクトリ構造:');
  console.log('public/audio/');
  console.log('├── bgm/        (背景音楽)');
  console.log('├── sfx/        (効果音)');
  console.log('├── voice/      (ボイス)');
  console.log('└── audio-config.json (設定ファイル)');
}

// 実行
setupAudioAssets().catch(console.error);