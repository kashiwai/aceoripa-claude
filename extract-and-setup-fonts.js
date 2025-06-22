const { registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// フォント展開と登録
async function extractAndSetupFonts() {
  console.log('📦 zipファイルからフォントを展開しています...\n');
  
  const fontZipDir = path.join(__dirname, 'public', 'images', 'font');
  const extractDir = path.join(__dirname, 'public', 'fonts', 'extracted');
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  
  // ディレクトリ作成
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }
  
  // zipファイル一覧取得
  const zipFiles = fs.readdirSync(fontZipDir)
    .filter(file => file.endsWith('.zip'))
    .map(file => path.join(fontZipDir, file));
  
  console.log(`🗜️  ${zipFiles.length}個のzipファイルを検出:`);
  zipFiles.forEach(file => console.log(`   - ${path.basename(file)}`));
  
  // 各zipファイルを展開
  for (const zipFile of zipFiles) {
    const baseName = path.basename(zipFile, '.zip');
    const targetDir = path.join(extractDir, baseName);
    
    try {
      console.log(`\n📂 展開中: ${baseName}`);
      
      // ディレクトリ作成
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // unzipコマンドで展開
      execSync(`unzip -o "${zipFile}" -d "${targetDir}"`, { stdio: 'pipe' });
      
      // フォントファイルを検索してコピー
      const fontFiles = findFontFiles(targetDir);
      console.log(`   フォントファイル ${fontFiles.length}個を検出`);
      
      fontFiles.forEach((fontFile, index) => {
        const fontName = `${baseName}_${index + 1}${path.extname(fontFile)}`;
        const targetPath = path.join(fontsDir, fontName);
        
        try {
          fs.copyFileSync(fontFile, targetPath);
          console.log(`   ✅ コピー完了: ${fontName}`);
        } catch (err) {
          console.error(`   ❌ コピー失敗: ${fontName}`, err.message);
        }
      });
      
    } catch (err) {
      console.error(`❌ 展開エラー: ${baseName}`, err.message);
    }
  }
  
  // 展開したフォントを登録
  console.log('\n📝 フォント登録開始...');
  await registerExtractedFonts();
  
  // 一時ディレクトリクリーンアップ
  try {
    fs.rmSync(extractDir, { recursive: true, force: true });
    console.log('\n🧹 一時ファイルをクリーンアップしました');
  } catch (err) {
    console.warn('⚠️  一時ファイルのクリーンアップに失敗:', err.message);
  }
}

// フォントファイルを再帰的に検索
function findFontFiles(dir) {
  const fontExtensions = ['.ttf', '.otf', '.ttc', '.woff', '.woff2'];
  const fontFiles = [];
  
  function searchDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          searchDir(itemPath);
        } else if (fontExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
          fontFiles.push(itemPath);
        }
      }
    } catch (err) {
      console.warn(`⚠️  ディレクトリアクセスエラー: ${currentDir}`, err.message);
    }
  }
  
  searchDir(dir);
  return fontFiles;
}

// 展開したフォントを登録
async function registerExtractedFonts() {
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  
  if (!fs.existsSync(fontsDir)) {
    console.log('❌ フォントディレクトリが見つかりません');
    return;
  }
  
  const fontFiles = fs.readdirSync(fontsDir)
    .filter(file => /\.(ttf|otf|ttc)$/i.test(file))
    .map(file => path.join(fontsDir, file));
  
  console.log(`\n📋 登録対象フォント: ${fontFiles.length}個`);
  
  const registeredFonts = [];
  
  fontFiles.forEach(fontFile => {
    const fontName = path.basename(fontFile, path.extname(fontFile));
    const cleanFontName = fontName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    try {
      registerFont(fontFile, { family: cleanFontName });
      registeredFonts.push({
        file: path.basename(fontFile),
        family: cleanFontName,
        path: fontFile
      });
      console.log(`✅ 登録成功: ${cleanFontName}`);
    } catch (err) {
      console.error(`❌ 登録失敗: ${cleanFontName}`, err.message);
    }
  });
  
  // 使用可能フォント一覧を生成
  generateFontList(registeredFonts);
  
  return registeredFonts;
}

// フォント一覧ファイル生成
function generateFontList(fonts) {
  const fontList = {
    timestamp: new Date().toISOString(),
    count: fonts.length,
    fonts: fonts.map(font => ({
      family: font.family,
      file: font.file,
      usage: `font: "bold 72px '${font.family}'"`
    }))
  };
  
  const listPath = path.join(__dirname, 'public', 'fonts', 'font-list.json');
  fs.writeFileSync(listPath, JSON.stringify(fontList, null, 2));
  
  console.log(`\n📄 フォント一覧を保存: ${listPath}`);
  console.log(`📝 登録済みフォント数: ${fonts.length}個`);
  
  // 使用例を表示
  console.log('\n💡 フォント使用例:');
  fonts.slice(0, 5).forEach(font => {
    console.log(`   ctx.font = "bold 72px '${font.family}'";`);
  });
  
  if (fonts.length > 5) {
    console.log(`   ... 他${fonts.length - 5}個のフォント`);
  }
}

// システムフォント登録
function registerSystemFonts() {
  console.log('\n🖥️  システムフォント登録...');
  
  const systemFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraginoKakuGothic_W9', weight: 'bold' },
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc', family: 'HiraginoKakuGothic_W6', weight: 'bold' },
    { path: '/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc', family: 'HiraginoMaruGothic', weight: 'normal' },
    { path: '/Library/Fonts/Arial Black.ttf', family: 'Arial_Black', weight: 'bold' },
    { path: '/System/Library/Fonts/Helvetica.ttc', family: 'Helvetica_Bold', weight: 'bold' },
  ];
  
  systemFonts.forEach(font => {
    if (fs.existsSync(font.path)) {
      try {
        registerFont(font.path, { family: font.family, weight: font.weight });
        console.log(`✅ システムフォント登録: ${font.family}`);
      } catch (err) {
        console.error(`❌ システムフォント登録失敗: ${font.family}`, err.message);
      }
    }
  });
}

// メイン実行
async function main() {
  console.log('🎨 カスタムフォントセットアップ開始\n');
  
  try {
    // システムフォント登録
    registerSystemFonts();
    
    // zipファイルからフォント展開・登録
    await extractAndSetupFonts();
    
    console.log('\n🎉 フォントセットアップ完了！');
    console.log('💡 バナー生成時に登録されたフォント名を使用できます');
    
  } catch (err) {
    console.error('❌ セットアップエラー:', err);
  }
}

// 直接実行時
if (require.main === module) {
  main();
}

module.exports = { extractAndSetupFonts, registerExtractedFonts };