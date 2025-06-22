const { registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// フォントディレクトリ作成
const fontsDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// フォント登録関数
function setupFonts() {
  console.log('📝 フォント設定開始...\n');

  // システムフォントのパス（macOS）
  const systemFonts = [
    // 日本語フォント
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'Hiragino Kaku Gothic StdN', weight: 'bold' },
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc', family: 'Hiragino Kaku Gothic Pro', weight: 'bold' },
    { path: '/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc', family: 'Hiragino Maru Gothic ProN', weight: 'normal' },
    { path: '/Library/Fonts/Arial Black.ttf', family: 'Arial Black', weight: 'bold' },
    { path: '/System/Library/Fonts/Helvetica.ttc', family: 'Helvetica', weight: 'bold' },
  ];

  // Google Fontsからダウンロード可能な無料フォント
  const googleFonts = {
    // 日本語フォント
    'Noto Sans JP': {
      weights: {
        'normal': 'https://fonts.gstatic.com/s/notosansjp/v42/-F6ofjtqLzI2JPCgQBnw7HFQMBhLVKBpVg.woff2',
        'bold': 'https://fonts.gstatic.com/s/notosansjp/v42/-F62fjtqLzI2JPCgQBnw7HFowLkFUIRZSk7f.woff2',
        'black': 'https://fonts.gstatic.com/s/notosansjp/v42/-F6pfjtqLzI2JPCgQBnw7HFQaioq1H1gVTbf.woff2'
      }
    },
    'M PLUS 1p': {
      weights: {
        'bold': 'https://fonts.gstatic.com/s/mplus1p/v27/e3tleuShHdiFyPFzBRrQnDQAUW3aq-5N.ttf',
        'black': 'https://fonts.gstatic.com/s/mplus1p/v27/e3tleuShHdiFyPFzBRrQnDQoU23aq-5N.ttf'
      }
    },
    'Sawarabi Gothic': {
      weights: {
        'normal': 'https://fonts.gstatic.com/s/sawarabigothic/v12/x3d4ckfVaqqa-BEj-I9mE65u3k3NBSk3E2YljQ.ttf'
      }
    },
    'Kosugi Maru': {
      weights: {
        'normal': 'https://fonts.gstatic.com/s/kosugimaru/v14/0nksC9PgP_wGh21A2KeqGiTqivr9iBq_.ttf'
      }
    }
  };

  // ローカルフォントを登録
  systemFonts.forEach(font => {
    if (fs.existsSync(font.path)) {
      try {
        registerFont(font.path, { family: font.family, weight: font.weight });
        console.log(`✅ 登録成功: ${font.family} (${font.weight})`);
      } catch (err) {
        console.error(`❌ 登録失敗: ${font.family}`, err.message);
      }
    }
  });

  // カスタムフォントディレクトリをチェック
  if (fs.existsSync(fontsDir)) {
    const customFonts = fs.readdirSync(fontsDir)
      .filter(file => /\.(ttf|otf|ttc)$/i.test(file));
    
    if (customFonts.length > 0) {
      console.log('\n📁 カスタムフォント検出:');
      customFonts.forEach(fontFile => {
        const fontPath = path.join(fontsDir, fontFile);
        const fontName = path.basename(fontFile, path.extname(fontFile));
        
        try {
          registerFont(fontPath, { family: fontName });
          console.log(`✅ 登録成功: ${fontName}`);
        } catch (err) {
          console.error(`❌ 登録失敗: ${fontName}`, err.message);
        }
      });
    }
  }

  console.log('\n💡 追加フォントの使い方:');
  console.log('1. public/fonts/ フォルダに .ttf, .otf, .ttc ファイルを配置');
  console.log('2. このスクリプトを再実行');
  console.log('3. バナー生成時にフォント名を指定\n');

  console.log('📝 利用可能なフォントスタイル例:');
  console.log('- font: "bold 72px \'Hiragino Kaku Gothic StdN\'" (極太ゴシック)');
  console.log('- font: "bold 72px \'Arial Black\'" (英語極太)');
  console.log('- font: "normal 72px \'Hiragino Maru Gothic ProN\'" (丸ゴシック)');
  console.log('- font: "900 72px \'Noto Sans JP\'" (Google Fonts)');

  return {
    systemFonts,
    googleFonts,
    fontsDir
  };
}

// 推奨フォントダウンロードスクリプト生成
function generateFontDownloadScript() {
  const script = `#!/bin/bash
# 推奨フリーフォントダウンロードスクリプト

echo "🎨 推奨フリーフォントをダウンロードします..."

# フォントディレクトリ作成
mkdir -p public/fonts

# 源ノ角ゴシック（Source Han Sans）
echo "📥 源ノ角ゴシック Heavy をダウンロード中..."
curl -L "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/Japanese/SourceHanSans-Heavy.otf" -o "public/fonts/SourceHanSans-Heavy.otf"

# M+ FONTS
echo "📥 M+ 1p Black をダウンロード中..."
curl -L "https://github.com/coz-m/MPLUS_FONTS/raw/master/fonts/ttf/Mplus1p-Black.ttf" -o "public/fonts/Mplus1p-Black.ttf"

# 自家製 Rounded M+
echo "📥 Rounded M+ 1c Black をダウンロード中..."
curl -L "http://jikasei.me/font/rounded-mplus/rounded-mplus-1c-black.ttf" -o "public/fonts/RoundedMplus1c-Black.ttf"

echo "✅ ダウンロード完了！"
echo "💡 node setup-fonts.js を実行してフォントを登録してください"
`;

  fs.writeFileSync('download-fonts.sh', script);
  fs.chmodSync('download-fonts.sh', '755');
  console.log('\n📥 フォントダウンロードスクリプトを生成しました: ./download-fonts.sh');
}

// エクスポート
module.exports = { setupFonts, generateFontDownloadScript };

// 直接実行時
if (require.main === module) {
  setupFonts();
  generateFontDownloadScript();
}