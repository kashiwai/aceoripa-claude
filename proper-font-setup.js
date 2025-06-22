const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// フォント確実登録システム
class FontManager {
  constructor() {
    this.registeredFonts = new Map();
    this.systemFonts = new Map();
  }

  // zipファイルからフォント抽出
  async extractFontsFromZip() {
    console.log('📦 zipファイルからフォント抽出開始...\n');
    
    const fontZipDir = path.join(__dirname, 'public', 'images', 'font');
    const extractDir = path.join(__dirname, 'public', 'fonts', 'final');
    const fontsDir = path.join(__dirname, 'public', 'fonts');
    
    // ディレクトリクリーンアップ・作成
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extractDir, { recursive: true });
    
    const zipFiles = fs.readdirSync(fontZipDir)
      .filter(file => file.endsWith('.zip'));
    
    console.log(`🗜️  検出されたzipファイル: ${zipFiles.length}個`);
    zipFiles.forEach(file => console.log(`   - ${file}`));
    
    const extractedFonts = [];
    
    for (const zipFile of zipFiles) {
      const zipPath = path.join(fontZipDir, zipFile);
      const baseName = path.basename(zipFile, '.zip');
      const targetDir = path.join(extractDir, baseName);
      
      try {
        console.log(`\n📂 展開中: ${baseName}`);
        fs.mkdirSync(targetDir, { recursive: true });
        
        // unzip実行
        execSync(`unzip -o "${zipPath}" -d "${targetDir}"`, { stdio: 'pipe' });
        
        // フォントファイル検索
        const fontFiles = this.findFontFiles(targetDir);
        console.log(`   フォントファイル: ${fontFiles.length}個`);
        
        fontFiles.forEach((fontFile, index) => {
          const ext = path.extname(fontFile);
          const fontName = `${baseName}${index > 0 ? `_${index + 1}` : ''}${ext}`;
          const finalPath = path.join(fontsDir, fontName);
          
          try {
            fs.copyFileSync(fontFile, finalPath);
            extractedFonts.push({
              originalName: baseName,
              fileName: fontName,
              filePath: finalPath,
              familyName: baseName.replace(/[^a-zA-Z0-9]/g, '_')
            });
            console.log(`   ✅ コピー成功: ${fontName}`);
          } catch (err) {
            console.error(`   ❌ コピー失敗: ${fontName}`, err.message);
          }
        });
        
      } catch (err) {
        console.error(`❌ 展開エラー: ${baseName}`, err.message);
      }
    }
    
    return extractedFonts;
  }
  
  // フォントファイル検索
  findFontFiles(dir) {
    const fontExtensions = ['.ttf', '.otf', '.ttc'];
    const fontFiles = [];
    
    const searchRecursive = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            searchRecursive(itemPath);
          } else if (fontExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
            fontFiles.push(itemPath);
          }
        }
      } catch (err) {
        // スキップ
      }
    };
    
    searchRecursive(dir);
    return fontFiles;
  }
  
  // フォント登録
  registerFonts(fontList) {
    console.log('\n📝 フォント登録開始...');
    
    // システムフォント登録
    const systemFonts = [
      { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraginoBold' },
      { path: '/Library/Fonts/Arial Black.ttf', family: 'ArialBlack' },
      { path: '/System/Library/Fonts/Helvetica.ttc', family: 'HelveticaBold' }
    ];
    
    systemFonts.forEach(font => {
      if (fs.existsSync(font.path)) {
        try {
          registerFont(font.path, { family: font.family });
          this.systemFonts.set(font.family, font.path);
          console.log(`✅ システムフォント: ${font.family}`);
        } catch (err) {
          console.error(`❌ システムフォント失敗: ${font.family}`);
        }
      }
    });
    
    // カスタムフォント登録
    fontList.forEach(font => {
      try {
        registerFont(font.filePath, { family: font.familyName });
        this.registeredFonts.set(font.familyName, {
          path: font.filePath,
          originalName: font.originalName,
          fileName: font.fileName
        });
        console.log(`✅ カスタムフォント: ${font.familyName}`);
      } catch (err) {
        console.error(`❌ カスタムフォント失敗: ${font.familyName}`, err.message);
      }
    });
    
    console.log(`\n📊 登録完了: システム${this.systemFonts.size}個 + カスタム${this.registeredFonts.size}個`);
  }
  
  // 登録済みフォント一覧
  getAvailableFonts() {
    const fonts = [];
    
    // システムフォント
    for (const [family, path] of this.systemFonts) {
      fonts.push({
        family,
        type: 'system',
        path,
        usage: `font: "bold 72px '${family}'"`
      });
    }
    
    // カスタムフォント
    for (const [family, info] of this.registeredFonts) {
      fonts.push({
        family,
        type: 'custom',
        originalName: info.originalName,
        path: info.path,
        usage: `font: "bold 72px '${family}'"`
      });
    }
    
    return fonts;
  }
  
  // フォント情報保存
  saveFontInfo() {
    const fontInfo = {
      timestamp: new Date().toISOString(),
      systemFonts: Array.from(this.systemFonts.entries()).map(([family, path]) => ({
        family, path, type: 'system'
      })),
      customFonts: Array.from(this.registeredFonts.entries()).map(([family, info]) => ({
        family, ...info, type: 'custom'
      })),
      totalCount: this.systemFonts.size + this.registeredFonts.size
    };
    
    const infoPath = path.join(__dirname, 'public', 'fonts', 'registered-fonts.json');
    fs.writeFileSync(infoPath, JSON.stringify(fontInfo, null, 2));
    console.log(`\n💾 フォント情報保存: ${infoPath}`);
    
    return fontInfo;
  }
  
  // テスト画像生成
  async generateFontTest() {
    console.log('\n🎨 フォントテスト画像生成...');
    
    const fonts = this.getAvailableFonts();
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);
    
    // フォントテスト
    let y = 50;
    fonts.forEach((font, index) => {
      if (y > 550) return; // 画面に収まらない場合はスキップ
      
      try {
        ctx.font = `bold 36px '${font.family}'`;
        ctx.fillStyle = font.type === 'system' ? '#00FF00' : '#FF6600';
        ctx.fillText(`${font.family}: テストフォント表示`, 20, y);
        y += 45;
      } catch (err) {
        console.error(`フォントテスト失敗: ${font.family}`);
      }
    });
    
    // 保存
    const buffer = canvas.toBuffer('image/png');
    const testPath = path.join(__dirname, 'public', 'images', 'font-test.png');
    fs.writeFileSync(testPath, buffer);
    console.log(`✅ フォントテスト画像: ${testPath}`);
  }
}

// メイン実行
async function setupFontsProper() {
  console.log('🚀 確実なフォントセットアップ開始\n');
  
  const fontManager = new FontManager();
  
  try {
    // 1. zipから抽出
    const extractedFonts = await fontManager.extractFontsFromZip();
    
    // 2. フォント登録
    fontManager.registerFonts(extractedFonts);
    
    // 3. 情報保存
    const fontInfo = fontManager.saveFontInfo();
    
    // 4. テスト画像生成
    await fontManager.generateFontTest();
    
    // 5. 利用可能フォント表示
    console.log('\n📋 利用可能フォント一覧:');
    const fonts = fontManager.getAvailableFonts();
    fonts.forEach(font => {
      console.log(`   ${font.type === 'system' ? '🖥️ ' : '📎 '} ${font.family} (${font.type})`);
    });
    
    console.log('\n🎉 フォントセットアップ完了！');
    console.log(`📝 総フォント数: ${fonts.length}個`);
    console.log('💡 次のステップ: node generate-proper-font-banners.js');
    
    return fontManager;
    
  } catch (err) {
    console.error('❌ セットアップエラー:', err);
    throw err;
  }
}

// 直接実行時
if (require.main === module) {
  setupFontsProper().catch(console.error);
}

module.exports = { FontManager, setupFontsProper };